import subprocess
from typing import List
import uuid
import os
import logging
import json

from pydantic import BaseModel, Field
from requests import Session

from utils.upload_r2 import upload_to_r2
from utils.s3_initial import initiate_video_upload
from models.user import User
from utils.skia_rendering import VideoTextRenderer
from schemas.burn import Style
from schemas.transcription import SubtitleListResponse
from core.celery_app import celery_app
from google import genai
from core.config import settings
from db.session import SessionLocal
from models.transcription import Transcription

logger = logging.getLogger(__name__)
api_key = settings.GEMINI_API_KEY

@celery_app.task
def burn_caption(get_presigned_url, subtitles):
    """Burn subtitles into a video file.
    
    Args:
        get_presigned_url: Presigned URL to download the video
        subtitles: Path to the subtitle file or subtitle content
        
    Returns:
        dict: Task result with output video path
    """
    try:
        input_path = get_presigned_url
        sub_path = subtitles
        # Create a local output filename
        output_path = f"subtitled_{uuid.uuid4().hex[:8]}.mp4"

        # FFmpeg Path Escaping & Styling
        # Escape backslashes and colons for FFmpeg filter syntax
        ffmpeg_sub_path = str(sub_path).replace("\\", "/").replace(":", "\\:")
        
        # Modern subtitle style: configurable font, Size 24, White Text, Black Outline
        style = "FontSize=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=1,Shadow=0,MarginV=25"

        # Run FFmpeg
        cmd = [
            "ffmpeg",
            "-y",
            "-i", str(input_path),
            "-vf", f"subtitles='{ffmpeg_sub_path}':force_style='{style}'",
            "-c:v", "libx264",
            "-crf", "23",       # Standard web quality
            "-preset", "fast",  # Good balance of speed/compression
            "-c:a", "copy",     # Copy audio without re-encoding
            str(output_path),
        ]

        result = subprocess.run(cmd, capture_output=True, text=True, check=True)

        # Subtitle file lifecycle
        # The subtitle file is managed by the storage backend; we intentionally do not delete it here.

        return {
            "status": "completed",
            "original_video": str(input_path),
            "output_video": str(output_path),
        }

    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg error: {e.stderr or e.stdout or 'Unknown error'}")
        raise e


@celery_app.task
def extract_audio_and_transcribe(presigned_url, video_id: int):
    """Extract audio from video and transcribe using Gemini API.
    
    Args:
        presigned_url: Presigned URL to download the video
        video_id: ID of the video in the database
        
    Returns:
        dict: Transcription result with video_id and subtitle count
    """
    unique_id = uuid.uuid4()
    audio_output = f"{unique_id}.mp3"
    db = SessionLocal()

    try:
        # Extract audio from video
        cmd = [
            "ffmpeg",
            "-y",
            "-i", presigned_url,  # Input is the URL
            "-vn",                # Disable video
            "-acodec", "libmp3lame",
            "-q:a", "4",
            audio_output          # Output file path
        ]
        
        subprocess.run(cmd, capture_output=True, text=True, check=True)

        # Upload to Gemini and generate transcript
        client = genai.Client(api_key=api_key)
        audio_file = client.files.upload(file=audio_output)
        
        # Generate Transcript with word limit per subtitle
        prompt = 'Generate a transcript of the speech with precise timestamps.If not in english generate transcript with english letters always. NO TRANSLATION'
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,  # Configurable Gemini model
            contents=[prompt, audio_file],
            config={
                "response_mime_type": "application/json",
                "response_json_schema": SubtitleListResponse.model_json_schema(),
            },
        )

        # Parse the response JSON
        transcription_data = json.loads(response.text)
        subtitles_raw = transcription_data.get("subtitle", [])
        
        # Format subtitles to match the desired structure
        formatted_subtitles = []
        for idx, sub in enumerate(subtitles_raw, start=1):
            formatted_subtitles.append({
                "id": f"sub-{idx}",
                "start": round(sub["start"], 2),
                "end": round(sub["end"], 2),
                "text": sub["text"]
            })
        
        # Save to database
        transcription = Transcription(
            video_id=video_id,
            subtitles=formatted_subtitles,
            status="COMPLETED"
        )
        db.add(transcription)
        db.commit()
        db.refresh(transcription)
        
        logger.info(f"Transcription completed for video {video_id}. Generated {len(formatted_subtitles)} subtitles.")
        
        return {
            "status": "success",
            "video_id": video_id,
            "transcription_id": transcription.id,
            "subtitle_count": len(formatted_subtitles)
        }

    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg error during audio extraction: {e.stderr or e.stdout or 'Unknown error'}")
        # Save failed status to database
        if video_id:
            transcription = Transcription(
                video_id=video_id,
                subtitles=[],
                status="FAILED"
            )
            db.add(transcription)
            db.commit()
        raise e
    except Exception as e:
        logger.error(f"Error during transcription: {str(e)}")
        # Save failed status to database
        if video_id:
            transcription = Transcription(
                video_id=video_id,
                subtitles=[],
                status="FAILED"
            )
            db.add(transcription)
            db.commit()
        raise e
    finally:
        # Cleanup: Always delete the local file to save disk space
        if os.path.exists(audio_output):
            try:
                os.remove(audio_output)
                logger.info(f"Cleaned up temporary audio file: {audio_output}")
            except OSError as e:
                logger.warning(f"Failed to delete temporary audio file {audio_output}: {e}")
        db.close()

@celery_app.task(bind=True)
def burn_animated_caption(
    self,
    get_presigned_url,
    subtitles_json: SubtitleListResponse,
    style: dict,
    output_filename:str,
    upload_info:dict
):
    try:
        # 1️⃣ Resolve input_url (Handle dict or JSON string)
        if isinstance(get_presigned_url, dict):
            input_url = get_presigned_url.get("download_url")
        elif isinstance(get_presigned_url, str):
            try:
                # Check if it's a JSON string representing the dict
                parsed_url_data = json.loads(get_presigned_url)
                if isinstance(parsed_url_data, dict) and "download_url" in parsed_url_data:
                    input_url = parsed_url_data["download_url"]
                else:
                    input_url = get_presigned_url
            except (json.JSONDecodeError, TypeError):
                # Fallback: Treat as direct URL string (checking for Python dict string repr)
                if get_presigned_url.startswith("{") and "'download_url':" in get_presigned_url:
                     import ast
                     try:
                        input_url = ast.literal_eval(get_presigned_url).get("download_url")
                     except:
                        input_url = get_presigned_url
                else:
                    input_url = get_presigned_url
        else:
            input_url = str(get_presigned_url)

        # 2️⃣ Resolve upload_info (Flexible handling)
        upl_url = None
        out_key = None
        out_public_url = None
        
        if isinstance(upload_info, dict):
            upl_url = upload_info.get("upload_url")
            out_key = upload_info.get("file_key") or upload_info.get("key")
            out_public_url = upload_info.get("public_url")
        elif isinstance(upload_info, str):
            # Try parsing as JSON first if it looks like JSON
            if upload_info.strip().startswith("{"):
                try:
                    parsed_info = json.loads(upload_info)
                    if isinstance(parsed_info, dict):
                        upl_url = parsed_info.get("upload_url")
                        out_key = parsed_info.get("file_key") or parsed_info.get("key")
                        out_public_url = parsed_info.get("public_url")
                    else:
                        upl_url = upload_info
                except json.JSONDecodeError:
                    # Not valid JSON, treat as raw URL string
                    upl_url = upload_info
            else:
                # It's a raw string (the URL itself)
                upl_url = upload_info
        
        if not upl_url:
             raise ValueError(f"Could not extract upload_url. Payload: {upload_info}")

        output_path = f"/tmp/{output_filename}"
        
        # 3️⃣ Render locally
        renderer = VideoTextRenderer(
            upload_url=upl_url,  # optional now
            input_url=input_url,
            style=style,
            subtitles=subtitles_json,
            output_path=output_path
        )

        renderer.render()
        
        # 4️⃣ Upload from Celery worker
        upload_to_r2(upl_url, output_path)

        return {
            "status": "completed",
            "output_key": out_key,
            "output_url": out_public_url,
        }

    except Exception as e:
        logger.exception("Skia rendering or upload failed")
        raise
