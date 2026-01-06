from http.client import HTTPResponse
from typing import Annotated
from fastapi import APIRouter, Cookie, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from dependency import get_current_user
from schemas.user import UserCreate, UserResponse
from controller.auth_controller import authenticate_user, create_jwt_token, create_new_user, rotate_refresh_token, verify_refresh_token
from models.user import User
from sqlalchemy.orm import Session
from db.session import get_db
from fastapi import Response

router = APIRouter()

@router.post("/login", status_code=status.HTTP_200_OK)
async def login(
    formData: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    db: Session = Depends(get_db)
):
    tokens = authenticate_user(formData.username, formData.password, db)
    response.set_cookie(
        key="refresh_token", 
        value=tokens["refresh"],
        httponly=True,
        secure=False,  # Enable in production with HTTPS
        samesite="lax"
    )
    return {"access_token": tokens["token"], "token_type": "bearer"}


@router.post("/signup",status_code=status.HTTP_201_CREATED)
async def signup(create_user:UserCreate, db:Session=Depends(get_db)):
    create_new_user(create_user,db)
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

# @router.post("/auth/logout")
# def logout(
#     refresh_token: str | None = Cookie(None),
#     db = Depends(get_db)
# ):
#     if refresh_token:
#         token_hash = hash_token(refresh_token)
#         db.query(RefreshToken).filter(
#             RefreshToken.token_hashed == token_hash
#         ).update({"revoked_at": datetime.utcnow()})

#         db.commit()



@router.post("/me",response_model=UserResponse)
async def read_me(user:Annotated[User,Depends(get_current_user)]):
    return user