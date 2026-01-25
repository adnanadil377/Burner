from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from utils.s3_initial import create_presigned_download_url, get_s3_client, initiate_video_upload
from models.transcription import Transcription
from schemas.burn import Style
from tasks.video_tasks import burn_animated_caption, extract_audio_and_transcribe
from models.video import Video
from models.user import User
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
import uuid
import logging
from core.config import settings

logger = logging.getLogger(__name__)

R2_ACCOUNT_ID = settings.R2_ACCOUNT_ID
R2_ACCESS_KEY = settings.R2_ACCESS_KEY
R2_SECRET_KEY = settings.R2_SECRET_KEY
R2_BUCKET_NAME = settings.R2_BUCKET_NAME
PRESIGNED_URL_EXPIRATION = settings.PRESIGNED_URL_EXPIRATION

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


def burn_video(
    video_id:int,
    style:Style,
    user:User,
    db: Session,
):
    if not video_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Video id not found")
    file_name=db.query(Video).filter(Video.id == video_id).first()
    if not file_name:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Video not found")
    presigned_url=create_presigned_download_url(user, file_name.s3_key, db)
    subtitles = db.query(Transcription).filter(Transcription.video_id==video_id).first()
    if not subtitles:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generate subtitles first")
    subtitles_json=subtitles.subtitles
    output_filename = f"animated_subtitled_{uuid.uuid4()}.mp4"
    upload_info = initiate_video_upload(user, output_filename, db)
    upload_url = upload_info["upload_url"]
    burn_animated_caption.delay(presigned_url,subtitles_json,style.model_dump(),output_filename,upload_url)
    
    