import subprocess
import uuid
import os
import logging
from core.celery_app import celery_app
from google import genai
from core.config import settings

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
        logger.error(f"FFmpeg error: {e.stderr if e.stderr else e.output}")
        raise e

@celery_app.task
def extract_audio_and_transcribe(presigned_url):
    """Extract audio from video and transcribe using Gemini API.
    
    Args:
        presigned_url: Presigned URL to download the video
        
    Returns:
        str: Transcription text
    """
    unique_id = uuid.uuid4()
    audio_output = f"{unique_id}.mp3"

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
        
        # Generate Transcript
        prompt = 'Generate a transcript of the speech.'
        response = client.models.generate_content(
            model='gemini-1.5-flash',  # Correct Gemini model name
            contents=[prompt, audio_file]
        )

        logger.info(f"Transcription completed for audio: {audio_output}")
        return response.text

    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg error during audio extraction: {e.stderr if e.stderr else e.output}")
        raise e
    except Exception as e:
        logger.error(f"Error during transcription: {str(e)}")
        raise e
    finally:
        # Cleanup: Always delete the local file to save disk space
        if os.path.exists(audio_output):
            try:
                os.remove(audio_output)
                logger.info(f"Cleaned up temporary audio file: {audio_output}")
            except OSError as e:
                logger.warning(f"Failed to delete temporary audio file {audio_output}: {e}")