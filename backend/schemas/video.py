from pydantic import BaseModel
from typing import Optional

class PresignedUploadResponse(BaseModel):
    upload_url: str
    file_key: str
    video_id: int

class DownloadUrlResponse(BaseModel):
    download_url: str

class VideoSchema(BaseModel):
    id: int
    status: str
    original_name: str

class VideoCompletionResponse(BaseModel):
    message: str
    video: VideoSchema
