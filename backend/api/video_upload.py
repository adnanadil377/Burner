from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status

from models.video import Video
from db.session import get_db
from controller.video_upload_controller import (
    call_celery_audio,
    create_presigned_download_url, 
    initiate_video_upload, 
    confirm_upload
)
from models.user import User
from dependency import get_current_user
from sqlalchemy.orm import Session
from schemas.video import (
    PresignedUploadResponse, 
    DownloadUrlResponse, 
    VideoCompletionResponse
)

router = APIRouter()

@router.get("/download", status_code=status.HTTP_200_OK, response_model=DownloadUrlResponse)
def download_video(
    user: Annotated[User, Depends(get_current_user)],
    file_name: str,
    db: Session = Depends(get_db)
):
    """Generate a presigned download URL for a video file."""
    return create_presigned_download_url(user, file_name, db)

@router.post("/upload", status_code=status.HTTP_202_ACCEPTED, response_model=PresignedUploadResponse)
def upload_video(
    user: Annotated[User, Depends(get_current_user)],
    file_name: str,
    content_type: str = "video/mp4",
    db: Session = Depends(get_db)
):
    """Initiate a video upload by generating a presigned upload URL."""
    return initiate_video_upload(
        user=user, 
        file_name=file_name, 
        db=db, 
        content_type=content_type
    )

@router.post("/upload-success", response_model=VideoCompletionResponse)
def upload_success(
    video_id: int, 
    user: Annotated[User, Depends(get_current_user)], 
    db: Session = Depends(get_db)
):
    """Confirm that a video upload is complete."""
    return confirm_upload(db=db, video_id=video_id, user=user)


@router.get("/get_user_videos")
def get_user_video(
    user: Annotated[User, Depends(get_current_user)], 
    db: Session = Depends(get_db)
):
    all_videos = db.query(Video).filter(Video.user_id == user.id).all()
    return {"all_video": all_videos}



@router.post("/transcribe")
def transcribe(
    video_id: int, 
    user: Annotated[User, Depends(get_current_user)], 
    db: Session = Depends(get_db)
):
    # Validate video_id is positive
    if video_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid video_id"
        )
    
    # Verify video exists and belongs to the user
    s3_key = db.query(Video).filter(
        Video.id == video_id,
        Video.user_id == user.id
    ).first()
    
    if not s3_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found or you don't have permission to access it"
        )
    
    return call_celery_audio(user, s3_key.s3_key)
