from http.client import HTTPResponse
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm,OAuth2,OAuth2PasswordBearer

from schemas.user import UserCreate
from controller.auth_controller import create_jwt_token, hash_password, verify_pass
from models.user import User
from sqlalchemy.orm import Session
from db.session import get_db

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

@router.post("/token")
async def login(formData: Annotated[OAuth2PasswordRequestForm, Depends()],db:Session=Depends(get_db)):
    user = db.query(User).filter(User.email==formData.username).all()
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    if not verify_pass(user.password, formData.password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = create_jwt_token({"user":user},30)
    print(token)
    return {"token":"token"}

@router.post("/signup")
async def signup(user_create:UserCreate, db:Session=Depends(get_db)):
    user = db.query(User).filter(User.email==user_create.email).all()
    if user:
        raise HTTPException(status_code=403, detail="Acc already exsits")
    print("ajsdf",user_create.password)
    new_user=User(name=user_create.name, email=user_create.email, password=hash_password(user_create.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"create":"success"}


@router.post("/items")
async def read_items(token: Annotated[str, Depends(oauth2_scheme)]):
    return {"token": token}