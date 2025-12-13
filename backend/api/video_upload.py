from typing import Annotated
from fastapi import APIRouter, Depends

from dependency import get_current_user

router = APIRouter()

@router.put("/video-upload")
def upload_video(user:Annotated[str,Depends(get_current_user)]):
    return "hello"