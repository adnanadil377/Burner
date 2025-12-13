from typing import Annotated
from fastapi import APIRouter, Depends, status

from db.session import get_db
from controller.video_upload_controller import presignedurl_get, presignedurl_upload
from models.user import User
from dependency import get_current_user
from sqlalchemy.orm import Session
router = APIRouter()

@router.get("/video-download", status_code=status.HTTP_200_OK)
def download_video(user:Annotated[User,Depends(get_current_user)], fileName:str):
    url=presignedurl_get(user,fileName)
    return {"download url":url}

@router.put("/video-upload",status_code=status.HTTP_202_ACCEPTED)
def upload_video(user:Annotated[User,Depends(get_current_user)], fileName:str,db:Session=Depends(get_db)):
    result = presignedurl_upload(user=user, file_name=fileName, db=db)
    return {"upload url":result}
