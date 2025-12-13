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

<<<<<<< HEAD
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(video_upload.router, prefix="/upload", tags=["upload"])
=======
app.include_router(auth.router, prefix="/auth", tags=["auth"])
>>>>>>> a15f05edca7079b8a86e9a3b69a8d73ab75641d2
