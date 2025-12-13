from pydantic import BaseModel

class VideoBase(BaseModel):
    user_id: int
    s3_key: str
    bucket: str
    original_name: str
    status: str

class VideoCreate(VideoBase):
    status: str = "PENDING"

class VideoResponse(VideoBase):
    id: int
    class Config:
        from_attributes = True

class PresignedUploadResponse(BaseModel):
    upload_url: str
    file_key: str
    video_id: int

class DownloadUrlResponse(BaseModel):
    download_url: str

class VideoCompletionResponse(BaseModel):
    message: str
    video: VideoResponse