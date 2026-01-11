from fastapi import FastAPI, Request
from api import auth
from api import video_upload
from db import base, session
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

base.Base.metadata.create_all(bind=session.engine)

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Burner")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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
