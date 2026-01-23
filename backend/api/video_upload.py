from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status

from models.video import Video
from models.transcription import Transcription
from db.session import get_db
from controller.video_upload_controller import (
    call_celery_audio,
    create_presigned_download_url, 
    initiate_video_upload, 
    initiate_video_upload, 
    confirm_upload,
    burn_video
)
from celery.result import AsyncResult
from core.celery_app import celery_app
from fastapi.responses import FileResponse
import os
from celery.result import AsyncResult
from core.celery_app import celery_app
from fastapi.responses import FileResponse
import os
from models.user import User
from dependency import get_current_user
from sqlalchemy.orm import Session
from schemas.video import (
    PresignedUploadResponse, 
    DownloadUrlResponse, 
    VideoCompletionResponse
)
from schemas.transcription import (
    TranscriptionResponse, 
    TranscriptionUpdate, 
    TranscriptionUpdateResponse
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
    video = db.query(Video).filter(
        Video.id == video_id,
        Video.user_id == user.id
    ).first()
    
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found or you don't have permission to access it"
        )
    
    return call_celery_audio(user, video.s3_key, video_id, db)


@router.get("/transcription/{video_id}", response_model=TranscriptionResponse)
def get_transcription(
    video_id: int,
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """Get the transcription for a specific video."""
    # Verify video exists and belongs to the user
    video = db.query(Video).filter(
        Video.id == video_id,
        Video.user_id == user.id
    ).first()
    
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found or you don't have permission to access it"
        )
    
    # Get the transcription
    transcription = db.query(Transcription).filter(
        Transcription.video_id == video_id
    ).first()
    
    if not transcription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transcription not found for this video"
        )
    
    return transcription


@router.put("/transcription/{video_id}", response_model=TranscriptionUpdateResponse)
def update_transcription(
    video_id: int,
    transcription_data: TranscriptionUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """Update the transcription/subtitles for a specific video."""
    # Verify video exists and belongs to the user
    video = db.query(Video).filter(
        Video.id == video_id,
        Video.user_id == user.id
    ).first()
    
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found or you don't have permission to access it"
        )
    
    # Get the transcription
    transcription = db.query(Transcription).filter(
        Transcription.video_id == video_id
    ).first()
    
    if not transcription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transcription not found for this video"
        )
    
    # Update the subtitles
    transcription.subtitles = [sub.model_dump() for sub in transcription_data.subtitles]
    transcription.status = "COMPLETED"
    
    db.commit()
    db.refresh(transcription)
    
    return {
        "message": "Transcription updated successfully",
        "transcription": transcription
    }


@router.post("/transcription/{video_id}/regenerate")
def regenerate_transcription(
    video_id: int,
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """Regenerate the transcription for a specific video."""
    # Verify video exists and belongs to the user
    video = db.query(Video).filter(
        Video.id == video_id,
        Video.user_id == user.id
    ).first()
    
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found or you don't have permission to access it"
        )
    
    # Delete existing transcription if it exists
    existing_transcription = db.query(Transcription).filter(
        Transcription.video_id == video_id
    ).first()
    
    if existing_transcription:
        db.delete(existing_transcription)
        db.commit()
    
    # Trigger new transcription task
    return call_celery_audio(user, video.s3_key, video_id, db)

@router.post("/burn/{video_id}")
def burn_captions(
    video_id: int,
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """Start the process of burning animated captions into the video."""
    return burn_video(user, video_id, db)

@router.get("/burn/{task_id}/status")
def get_burn_status(task_id: str, user: Annotated[User, Depends(get_current_user)]):
    """Check the status of the burning task."""
    task_result = AsyncResult(task_id, app=celery_app)
    
    if task_result.state == 'PENDING':
        return {"status": "PENDING"}
    elif task_result.state == 'FAILURE':
        return {"status": "FAILURE", "error": str(task_result.result)}
    elif task_result.state == 'SUCCESS':
        # The task returns a dict with 'output_video' path relative to backend root (?)
        # task_result.result is the return value of the function
        result = task_result.result
        return {
            "status": "SUCCESS", 
            "output_video": result.get("output_video"),
            "download_endpoint": f"/video/download-burned/{os.path.basename(result.get('output_video'))}" 
        }
    
    return {"status": task_result.state}

@router.get("/download-burned/{filename}")
def download_burned_video(filename: str):
    """Serve the burned video file."""
    # Security: Ensure filename is just a filename, not a path
    if "/" in filename or "\\" in filename or ".." in filename:
         raise HTTPException(status_code=400, detail="Invalid filename")
         
    file_path = filename # Files are in root of backend currently
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found or expired")
        
    return FileResponse(
        file_path, 
        media_type="video/mp4", 
        filename=f"burned_{filename}"
    )
