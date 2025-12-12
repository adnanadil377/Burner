from fastapi import FastAPI
from api import auth
from db import base, session

base.Base.metadata.create_all(bind=session.engine)

app = FastAPI(title="Burner")

app.include_router(auth.router, prefix="/auth", tags=["auth"])