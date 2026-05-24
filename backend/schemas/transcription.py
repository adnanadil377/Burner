from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class ViralStyle(BaseModel):
    font_family:str = Field(description="font family of that particular part of subtitles")
    font_color:str = Field(description="Font color fo that particular part of subtitles")
    font_size:int = Field(description="Perfect font size")
    font_weight:int = Field(description="Perfect font weight")
    font_style: str = Field(description="font_style like glow or neon etc"),
    position: dict = Field(description="x,y position on the video")

class ViralSubtitle(BaseModel):
    id: str = Field(description="Unique identifier for the subtitle segment (e.g., 'sub-1')")
    start: float = Field(description="Start time in seconds")
    end: float = Field(description="End time in seconds")
    text: str = Field(description="Transcribed text for this segment")
    style: ViralStyle

class SubtitlesResponse(BaseModel):
    Subtitle:List[ViralSubtitle]

class Subtitle(BaseModel):
    id: str = Field(description="Unique identifier for the subtitle segment (e.g., 'sub-1')")
    start: float = Field(description="Start time in seconds")
    end: float = Field(description="End time in seconds")
    text: str = Field(description="Transcribed text for this segment")
    style: ViralStyle | None = Field(default=None, description="Viral style for this segment")

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

