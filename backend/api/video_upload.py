from typing import Annotated
from fastapi import APIRouter, Depends, status

from db.session import get_db
from controller.video_upload_controller import (
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

@router.get("/video-download", status_code=status.HTTP_200_OK, response_model=DownloadUrlResponse)
def download_video(
    user: Annotated[User, Depends(get_current_user)],
    file_name: str,
    db: Session = Depends(get_db)
):
    """Generate a presigned download URL for a video file."""
    return create_presigned_download_url(user, file_name, db)

@router.post("/video-upload", status_code=status.HTTP_202_ACCEPTED, response_model=PresignedUploadResponse)
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
