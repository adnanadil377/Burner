from pydantic import BaseModel, EmailStr
from models.video import Video

class VideoBase(BaseModel):
    user_id: int
    s3_key:str
    bucket: str
    original_name:str
    status: str

class VideoCreate(VideoBase):
    status="PENDING"

class VideoResponse(VideoBase):
    id: int
    class Config:
        from_attributes=True