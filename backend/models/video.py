from sqlalchemy import Column, Integer, String
from db.base import Base

class Video(Base):
    __tablename__="videos"
    id=Column(Integer, primary_key=True, index=True)
    user_id=Column(Integer, index=True)
    s3_key=Column(String, unique=True, index=True)
    bucket=Column(String, nullable=False)
    original_name=Column(String, nullable=False)
    status=Column(String, nullable=False)