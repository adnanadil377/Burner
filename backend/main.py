from fastapi import FastAPI
from api import auth
from api import video_upload
from db import base, session
from fastapi.middleware.cors import CORSMiddleware

base.Base.metadata.create_all(bind=session.engine)

app = FastAPI(title="Burner")

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(video_upload.router, prefix="/video", tags=["upload"])
