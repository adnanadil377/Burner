from http.client import HTTPResponse
from typing import Annotated
from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import BackgroundTasks

from dependency import get_current_user
from schemas.user import UserCreate, UserResponse
from controller.auth_controller import authenticate_user, create_jwt_token, create_new_user, logout_user, rotate_refresh_token, send_email_verification_token, user_email_verification, verify_refresh_token
from models.user import User
from sqlalchemy.orm import Session
from db.session import get_db
from fastapi import Response

router = APIRouter()

@router.post("/login", status_code=status.HTTP_200_OK)
async def login(
    request: Request,
    formData: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    db: Session = Depends(get_db)
):
    tokens = authenticate_user(formData.username, formData.password, db, request)
    response.set_cookie(
        key="refresh_token", 
        value=tokens["refresh"],
        httponly=True,
        secure=False,  # Enable in production with HTTPS
        samesite="lax"
    )
    return {"access_token": tokens["token"], "token_type": "bearer"}


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(
    create_user: UserCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    await create_new_user(create_user, db, background_tasks)
    return {"message": "User created successfully"}


@router.post("/refresh", status_code = status.HTTP_200_OK)
async def refresh(response:Response,refresh_token:str | None = Cookie(default=None),db:Session = Depends(get_db)):

    new_refresh_token,new_access_token=rotate_refresh_token(refresh_token, db)

    response.set_cookie(
        key="refresh_token", 
        value=new_refresh_token,
        httponly=True,
        secure=False,  # Enable in production with HTTPS
        samesite="lax"
    )
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.post("/logout")
async def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db)
):
    message=logout_user(refresh_token, db, response)
    return message


@router.post("/verify-email")
async def verify_email(
    user:Annotated[User, Depends(get_current_user)],
    email_verification_token:str, 
    db:Annotated[Session, Depends(get_db)]
    ):
    verified_email = user_email_verification(email_verification_token,user, db)
    return verified_email

@router.post("/resent-email-verification")
async def resent_email_verification(
    user: Annotated[User, Depends(get_current_user)],
    background_tasks: BackgroundTasks,
    db: Annotated[Session, Depends(get_db)]
):
    res = await send_email_verification_token(user, db, background_tasks)
    return res

@router.post("/me",response_model=UserResponse)
async def read_me(user:Annotated[User,Depends(get_current_user)]):
    return user