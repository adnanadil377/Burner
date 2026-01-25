from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from tasks.video_tasks import extract_audio_and_transcribe, burn_animated_caption
from models.transcription import Transcription
from models.video import Video
from models.user import User
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from botocore.config import Config
import uuid
import logging
from core.config import settings

logger = logging.getLogger(__name__)

R2_ACCOUNT_ID = settings.R2_ACCOUNT_ID
R2_ACCESS_KEY = settings.R2_ACCESS_KEY
R2_SECRET_KEY = settings.R2_SECRET_KEY
R2_BUCKET_NAME = settings.R2_BUCKET_NAME
PRESIGNED_URL_EXPIRATION = settings.PRESIGNED_URL_EXPIRATION

# Allowed video file extensions
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'mov', 'avi', 'webm', 'mkv', 'flv', 'wmv', 'm4v'}

def get_s3_client():
    """Create and return an S3 client for Cloudflare R2."""
    return boto3.client(
        service_name="s3",
        endpoint_url=f'https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com',
        aws_access_key_id=R2_ACCESS_KEY,
        aws_secret_access_key=R2_SECRET_KEY,
        region_name="auto",
        config=Config(signature_version="s3v4")
    )

def call_celery_audio(user: User, s3_key: str, video_id: int, db: Session) -> dict:
    """Trigger Celery task to extract audio and transcribe video.
    
    Args:
        user: The authenticated user
        s3_key: The S3 key of the video file
        video_id: The ID of the video in the database
        db: Database session
        
    Returns:
        dict: Task information
    """
    try:
        # Verify the video belongs to the user
        video = db.query(Video).filter(
            Video.id == video_id,
            Video.user_id == user.id
        ).first()
        
        if not video:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Video not found or unauthorized"
            )
        
        # Generate presigned URL for the video
        s3_client = get_s3_client()
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': R2_BUCKET_NAME,
                'Key': s3_key
            },
            ExpiresIn=PRESIGNED_URL_EXPIRATION
        )
        
        # Trigger the Celery task with video_id
        task = extract_audio_and_transcribe.delay(presigned_url, video_id)
        
        return {
            "message": "Transcription task started",
            "task_id": task.id,
            "video_id": video_id
        }
    except ClientError as e:
        error_code = getattr(e, "response", {}).get("Error", {}).get("Code", "Unknown")
        logger.error(f"Failed to generate URL for transcription: {error_code}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start transcription task"
        )

def get_file_extension(filename: str) -> str:
    """Extract file extension from filename."""
    if "." in filename:
        return filename.rsplit(".", 1)[1].lower()
    return ""

def validate_video_extension(filename: str) -> str:
    """Validate that the file has an allowed video extension."""
    ext = get_file_extension(filename)
    if not ext:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must have an extension"
        )
    if ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_VIDEO_EXTENSIONS)}"
        )
    return ext

def create_presigned_download_url(user: User, file_name: str, db: Session) -> dict:
    """Generate a presigned download URL for a video file.
    
    Validates that the file belongs to the authenticated user before generating URL.
    """
    # Verify that the file belongs to the user
    video = db.query(Video).filter(
        Video.user_id == user.id,
        Video.s3_key == file_name
    ).first()
    
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found or you don't have permission to access it"
        )
    
    s3_client = get_s3_client()
    try:
        get_url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': R2_BUCKET_NAME, 
                'Key': file_name
            },
            ExpiresIn=PRESIGNED_URL_EXPIRATION
        )
        return {"download_url": get_url}
    except ClientError as e:
        error_code = getattr(e, "response", {}).get("Error", {}).get("Code", "Unknown")
        error_message = getattr(e, "response", {}).get("Error", {}).get("Message", str(e))
        logger.error(f"Failed to generate download URL for user {user.id}: {error_code} - {error_message}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Could not generate download link: {error_code} - {error_message}"
        )
    except NoCredentialsError as e:
        logger.error(f"Credentials error generating download URL for user {user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not generate download link: Credentials error"
        )

def initiate_video_upload(user: User, file_name: str, db: Session, content_type: str = "video/mp4") -> dict:
    """Initiate a video upload by generating a presigned upload URL and creating a database record.
    
    This function:
    1. Validates the file extension
    2. Creates a unique S3 key for the file
    3. Generates a presigned upload URL
    4. Creates a database record with PENDING status
    """
    user_id = str(user.id)
    logger.info(f"Initiating video upload for user {user.id}, file: {file_name}")
    
    # Validate file extension
    ext = validate_video_extension(file_name)
    
    unique_filename = f"{uuid.uuid4()}.{ext}"
    s3_key = f"{user_id}/{unique_filename}"
    
    s3_client = get_s3_client()
    
    # First, generate presigned URL
    try:
        put_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': R2_BUCKET_NAME,
                'Key': s3_key,
                'ContentType': content_type,
                'Metadata': {
                    'original-name': file_name
                }
            },
            ExpiresIn=PRESIGNED_URL_EXPIRATION
        )
    except ClientError as e:
        error_code = getattr(e, "response", {}).get("Error", {}).get("Code", "Unknown")
        error_message = getattr(e, "response", {}).get("Error", {}).get("Message", str(e))
        logger.error(f"Failed to generate upload URL for user {user.id}: {error_code} - {error_message}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Could not generate upload link: {error_code} - {error_message}"
        )
    
    # If URL generation succeeded, create DB record
    try:
        new_video = Video(
            user_id=user.id,
            s3_key=s3_key, 
            bucket=R2_BUCKET_NAME, 
            original_name=file_name, 
            status="PENDING"
        )
        db.add(new_video)
        db.commit()
        db.refresh(new_video)
        
        return {
            "upload_url": put_url, 
            "file_key": s3_key,
            "video_id": new_video.id
        }
    except Exception as e:
        # Rollback database changes on any error
        db.rollback()
        logger.error(f"Database error during upload initiation for user {user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create video record"
        )


def confirm_upload(db: Session, video_id: int, user: User) -> dict:
    """Confirm that a video upload is complete and verify the file exists in storage."""
    video = db.query(Video).filter(Video.id == video_id, Video.user_id == user.id).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
        
    if video.status == "COMPLETED":
        return {"message": "Video already marked as completed", "video": video}

    # Verify file exists in R2
    s3_client = get_s3_client()
    try:
        s3_client.head_object(Bucket=R2_BUCKET_NAME, Key=video.s3_key)
    except ClientError as e:
        error_code = getattr(e, "response", {}).get("Error", {}).get("Code", "Unknown")
        logger.error(f"File verification failed for video {video_id}: {error_code}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File verification failed. Video not found in storage."
        )

    video.status = "COMPLETED"
    db.commit()
    db.refresh(video)
    logger.info(f"Upload confirmed for video {video_id}")
    logger.info(f"Upload confirmed for video {video_id}")
    return {"message": "Upload verified and completed", "video": video}

def burn_video(user: User, video_id: int, db: Session) -> dict:
    """Trigger Celery task to burn animated captions into the video."""
    
    # 1. Fetch Video
    video = db.query(Video).filter(Video.id == video_id, Video.user_id == user.id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    # 2. Fetch Transcription
    transcription = db.query(Transcription).filter(Transcription.video_id == video_id).first()
    if not transcription or not transcription.subtitles:
        raise HTTPException(status_code=400, detail="No subtitles found for this video")

    # 3. Generate Presigned URL for input
    s3_client = get_s3_client()
    try:
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': R2_BUCKET_NAME, 'Key': video.s3_key},
            ExpiresIn=PRESIGNED_URL_EXPIRATION
        )
    except ClientError as e:
        logger.error(f"S3 Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to access video file")

    # 4. Transform Subtitles for Skia Renderer
    # The renderer expects a specific format. 
    # Current formatting in DB is: {"id": "sub-1", "start": 0.0, "end": 1.0, "text": "foo"}
    # We can enrich this with default styles here or let the renderer/task handle defaults.
    # Let's pass the DB subtitles directly, enabling the renderer (or task) to apply defaults.
    
    # However, let's inject a default style if missing to ensure it looks good immediately.
    enriched_subtitles = []
    for sub in transcription.subtitles:
        # Create a copy
        s = sub.copy()
        if "style" not in s:
            s["style"] = {
                "fontSize": 48,
                "fontFamily": "Arial",
                "color": "#FFFFFF",
                "position": {"x": 0.5, "y": 0.85},
                # We can add animation instructions here too
            }
        enriched_subtitles.append(s)

    # 5. Call Celery Task
    task = burn_animated_caption.delay(video_id, str(user.id), presigned_url, enriched_subtitles)
    
    return {
        "message": "Burning process started",
        "task_id": task.id
    }
