from http.client import HTTPResponse
from typing import Annotated
from fastapi import APIRouter, Cookie, Depends, Request, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import BackgroundTasks
from slowapi import Limiter
from slowapi.util import get_remote_address

from dependency import get_current_user
from schemas.user import UserCreate, UserResponse, EmailVerificationRequest, ForgotPasswordRequest, ResetPasswordRequest
from controller.auth_controller import authenticate_user, create_new_user, logout_user, rotate_refresh_token, send_email_verification_token, send_password_reset_token, user_email_verification, reset_user_password
from models.user import User
from sqlalchemy.orm import Session
from db.session import get_db
from core.config import settings

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

def set_refresh_token_cookie(response: Response, token: str) -> None:
    """Helper function to set refresh token cookie with consistent settings."""
    response.set_cookie(
        key="refresh_token", 
        value=token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax"
    )

@router.post("/login", status_code=status.HTTP_200_OK)
@limiter.limit("5/minute")
async def login(
    request: Request,
    formData: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    db: Session = Depends(get_db)
):
    tokens = authenticate_user(formData.username, formData.password, db, request)
    set_refresh_token_cookie(response, tokens["refresh"])
    return {"access_token": tokens["token"], "token_type": "bearer"}


@router.post("/signup", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour")
async def signup(
    request: Request,
    create_user: UserCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    await create_new_user(create_user, db, background_tasks)
    return {"message": "User created successfully"}


@router.post("/refresh", status_code = status.HTTP_200_OK)
@limiter.limit("10/minute")
async def refresh(
    request: Request,
    response:Response,
    refresh_token:str | None = Cookie(default=None),
    db:Session = Depends(get_db)
):
    new_refresh_token,new_access_token=rotate_refresh_token(refresh_token, db)
    set_refresh_token_cookie(response, new_refresh_token)
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.post("/logout")
@limiter.limit("10/minute")
async def logout(
    request: Request,
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db)
):
    message=logout_user(refresh_token, db, response)
    return message


@router.post("/verify-email")
@limiter.limit("5/minute")
async def verify_email(
    request: Request,
    verification_request: EmailVerificationRequest,
    db:Annotated[Session, Depends(get_db)]
    ):
    verified_email = await user_email_verification(verification_request.email_verification_token, db)
    return verified_email

@router.post("/resend-email-verification")
@limiter.limit("2/minute")
@limiter.limit("5/hour")
async def resend_email_verification(
    request: Request,
    user: Annotated[User, Depends(get_current_user)],
    background_tasks: BackgroundTasks,
    db: Annotated[Session, Depends(get_db)]
):
    if user.email_verified:
        return {"message": "Email already verified"}

    await send_email_verification_token(
        user=user,
        db=db,
        background_tasks=background_tasks
    )

    return {
        "message": "Verification email sent if not already verified"
    }

@router.post("/forgot-password")
@limiter.limit("3/hour")
async def forgot_password(
    request: Request,
    forgot_request: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Annotated[Session, Depends(get_db)]
):
    await send_password_reset_token(forgot_request.email, db, background_tasks)
    return {"message": "If the email exists, a password reset link has been sent"}

@router.post("/reset-password")
@limiter.limit("5/minute")
async def reset_password(
    request: Request,
    reset_request: ResetPasswordRequest,
    db: Annotated[Session, Depends(get_db)]
):
    result = await reset_user_password(reset_request.token, reset_request.new_password, db)
    return result

@router.post("/me",response_model=UserResponse)
async def read_me(user:Annotated[User,Depends(get_current_user)]):
    return user

