from typing import Annotated, Optional
from fastapi import APIRouter, Depends, status, Header

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
    file_name: str
):
    return create_presigned_download_url(user, file_name)

@router.put("/video-upload", status_code=status.HTTP_202_ACCEPTED, response_model=PresignedUploadResponse)
def upload_video(
    user: Annotated[User, Depends(get_current_user)], 
    file_name: str, 
    content_type: str = Header(default="video/mp4", convert_underscores=False),
    db: Session = Depends(get_db)
):
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
    return confirm_upload(db=db, video_id=video_id, user=user)
