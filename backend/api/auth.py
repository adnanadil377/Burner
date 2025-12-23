from http.client import HTTPResponse
from typing import Annotated
from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from dependency import get_current_user
from schemas.user import UserCreate, UserResponse
from controller.auth_controller import authenticate_user, create_new_user
from models.user import User
from sqlalchemy.orm import Session
from db.session import get_db

router = APIRouter()

@router.post("/login", status_code=status.HTTP_200_OK)
async def login(formData: Annotated[OAuth2PasswordRequestForm, Depends()],db:Session=Depends(get_db)):
    token=authenticate_user(formData.username, formData.password, db)
    return {"access_token": token, "token_type": "bearer"}

@router.post("/signup",status_code=status.HTTP_201_CREATED)
async def signup(create_user:UserCreate, db:Session=Depends(get_db)):
    create_new_user(create_user,db)
    return {"message": "User created successfully"}


@router.post("/me",response_model=UserResponse)
async def read_me(user:Annotated[User,Depends(get_current_user)]):
    return user