from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status

from utils.s3_initial import create_presigned_download_url, initiate_video_upload
from schemas.burn import Style
from models.video import Video
from models.transcription import Transcription
from db.session import get_db
from controller.video_upload_controller import (
    burn_video,
    call_celery_audio,  
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


@router.get("/all")
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
def burn_caption(
    video_id:int,
    style:Style,
    user:Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    return burn_video(video_id,style,user,db)