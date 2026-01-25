from pydantic import BaseModel

class Position(BaseModel):
    x:int
    y:int

class Style(BaseModel):
    font_family: str
    font_color: str
    font_size: int
    font_weight: int
    font_style: str
    position: Position

