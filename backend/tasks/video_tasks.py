import subprocess
import uuid
import os
from core.celery_app import celery_app
from google import genai
from core.config import settings
api_key=settings.GEMINI_API_KEY

@celery_app.task
def burn_caption(get_presigned_url,subtitles,put_presigned_url):
    try:
        input_path = get_presigned_url
        # sub_path = Path(subtitle_path).resolve()
        sub_path = subtitles
        output_path = input_path.with_name(f"{input_path.stem}_subtitled_{uuid.uuid4().hex[:4]}.mp4")

        # 2. FFmpeg Path Escaping & Styling
        # Escape backslashes and colons for FFmpeg filter syntax
        ffmpeg_sub_path = str(sub_path).replace("\\", "/").replace(":", "\\:")
        
        # Modern subtitle style: Arial, Size 24, White Text, Black Outline, slightly raised margin
        style = "Fontname=Arial,FontSize=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=1,Shadow=0,MarginV=25"

        # 3. Run FFmpeg
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

        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            print(f"FFmpeg Error: {result.stderr}")
            raise RuntimeError(f"FFmpeg failed: {result.stderr}")

        # 4. Cleanup Local SRT File
        # Now that it is burned into the video, we don't need the text file
        # try:
        #     os.remove(sub_path)
        # except OSError:
        #     pass

        return {
            "status": "completed",
            "original_video": str(input_path),
            "output_video": str(output_path),
        }

    except subprocess.CalledProcessError as e:
        print(f"FFmpeg error: {e.stderr}")
        raise e

@celery_app.task
def extract_audio_and_transcribe(presigned_url):

    unique_id = uuid.uuid4()
    audio_output = f"{unique_id}.mp3"

    try:
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

        # 3. Upload to Gemini
        client = genai.Client(api_key=api_key)
        # Note: client.files.upload takes a file path, not the subprocess output string
        audio_file = client.files.upload(file=audio_output)
        
        # 4. Generate Transcript
        prompt = 'Generate a transcript of the speech.'
        response = client.models.generate_content(
            model='gemini-3-flash-preview', # Recommended latest version
            contents=[prompt, audio_file]
        )

        print(f"Transcription result: {response.text}")
        return response.text

    except subprocess.CalledProcessError as e:
        print(f"FFmpeg error: {e.stderr}")
        raise e
    finally:
        # 5. Cleanup: Always delete the local file to save disk space
        if os.path.exists(audio_output):
            os.remove(audio_output)