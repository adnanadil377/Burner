from fastapi import FastAPI
from api import auth
from api import video_upload
from db import base, session

base.Base.metadata.create_all(bind=session.engine)

app = FastAPI(title="Burner")

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(video_upload.router, prefix="/upload", tags=["upload"])