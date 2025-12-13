from fastapi import HTTPException, status
from sqlalchemy.orm import Session
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
ALLOWED_VIDEO_EXTENSIONS = {"mp4", "mov", "avi", "webm", "mkv", "flv", "wmv"}

def get_s3_client():
    return boto3.client(
        service_name="s3",
        endpoint_url=f'https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com',
        aws_access_key_id=R2_ACCESS_KEY,
        aws_secret_access_key=R2_SECRET_KEY,
        region_name="auto",
        config=Config(signature_version="s3v4")
    )

s3 = get_s3_client()

def get_file_extension(filename: str) -> str:
    if "." in filename:
        return filename.rsplit(".", 1)[1].lower()
    return ""

def validate_video_extension(filename: str) -> str:
    """Validate that the file has an allowed video extension."""
    ext = get_file_extension(filename)
    if not ext:
        raise HTTPException(status_code=400, detail="File must have an extension")
    if ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Allowed video formats: {', '.join(sorted(ALLOWED_VIDEO_EXTENSIONS))}"
        )
    return ext

def create_presigned_download_url(user: User, file_name: str, db: Session) -> dict:
    # Verify that the file belongs to the user
    video = db.query(Video).filter(
        Video.s3_key == file_name,
        Video.user_id == user.id
    ).first()
    
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found or you don't have permission to access it"
        )
    
    try:
        get_url = s3.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': R2_BUCKET_NAME, 
                'Key': file_name
            },
            ExpiresIn=PRESIGNED_URL_EXPIRATION
        )
        return {"download_url": get_url}
    except (ClientError, NoCredentialsError) as e:
        error_type = type(e).__name__
        error_msg = str(e)
        logger.error(f"Failed to generate download URL for user {user.id}, file {file_name}: [{error_type}] {error_msg}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Could not generate download link. Please try again later."
        )

def initiate_video_upload(user: User, file_name: str, db: Session, content_type: str = "video/mp4") -> dict:
    user_id = str(user.id)
    
    # Validate file extension against allowlist
    ext = validate_video_extension(file_name)
        
    unique_filename = f"{uuid.uuid4()}.{ext}"
    s3_key = f"{user_id}/{unique_filename}"

    try:
        # Generate presigned URL first
        put_url = s3.generate_presigned_url(
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
        
        # Create DB record with PENDING status only after URL generation succeeds
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

    except ClientError as e:
        # Rollback any database changes
        db.rollback()
        error_code = "Unknown"
        error_message = str(e)
        if hasattr(e, "response"):
            error_code = e.response.get("Error", {}).get("Code", "Unknown")
            error_message = e.response.get("Error", {}).get("Message", str(e))
        logger.error(f"Failed to generate UPLOAD URL for user {user.id}: {error_code} - {error_message}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Could not generate upload link. Please try again later."
        )
    except Exception as e:
        # Rollback database changes for any other errors
        db.rollback()
        logger.error(f"Unexpected error during upload initiation for user {user.id}: {str(e)}")
        raise

def confirm_upload(db: Session, video_id: int, user: User) -> dict:
    video = db.query(Video).filter(Video.id == video_id, Video.user_id == user.id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    if video.status == "COMPLETED":
        return {"message": "Video already marked as completed", "video": video}

    # Verify file exists in R2
    try:
        s3.head_object(Bucket=R2_BUCKET_NAME, Key=video.s3_key)
    except ClientError:
        raise HTTPException(status_code=400, detail="File verification failed. Video not found in storage.")

    video.status = "COMPLETED"
    db.commit()
    db.refresh(video)
    return {"message": "Upload verified and completed", "video": video}