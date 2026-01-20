from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class Subtitle(BaseModel):
    id: str = Field(description="Unique identifier for the subtitle segment (e.g., 'sub-1')")
    start: float = Field(description="Start time in seconds")
    end: float = Field(description="End time in seconds")
    text: str = Field(description="Transcribed text for this segment")

class TranscriptionBase(BaseModel):
    video_id: int
    subtitles: List[Subtitle]
    status: str = "COMPLETED"

class TranscriptionCreate(TranscriptionBase):
    pass

class TranscriptionResponse(TranscriptionBase):
    id: int
    created_at: datetime
    updated_at: datetime | None = None
    
    class Config:
        from_attributes = True

class SubtitleListResponse(BaseModel):
    subtitles: List[Subtitle]

class TranscriptionUpdate(BaseModel):
    subtitles: List[Subtitle] = Field(description="Updated list of subtitles")

class TranscriptionUpdateResponse(BaseModel):
    message: str
    transcription: TranscriptionResponse
