from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from tasks.video_tasks import extract_audio_and_transcribe
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
    return {"message": "Upload verified and completed", "video": video}
