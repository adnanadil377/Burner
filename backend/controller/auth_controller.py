from datetime import UTC, datetime, timedelta
from typing import Annotated
from fastapi import HTTPException, status
from jose import jwt, JWTError
from passlib.context import CryptContext
from models.user import User
from schemas.user import UserCreate
from core.config import settings
from sqlalchemy.orm import Session
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = settings.ALGORITHM
SECRET = settings.SECRET_KEY
REFRESH_SECRET_KEY = settings.REFRESH_KEY

def get_hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password:str, hash_password:str):
    return pwd_context.verify(plain_password, hash_password)

def create_jwt_token(data:dict, expires_delta:int):
    to_encode = data.copy()
    expire=datetime.now(UTC) + timedelta(minutes=expires_delta)
    to_encode["exp"]=expire
    encoded = jwt.encode(to_encode,SECRET,algorithm=ALGORITHM)
    return encoded

def create_refresh_token(data:dict, expires_delta:int):
    to_encode = data.copy()
    expire = datetime.now(UTC) + timedelta(days=expires_delta)
    to_encode["exp"] = expire
    # Use dictionary access, not object attribute
    encoded_jwt = jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(email:str, password:str, db:Session):
    lower_email = email.lower()
    user = db.query(User).filter(User.email==lower_email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    if not verify_password(password,user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    token = create_jwt_token({"user":user.email},30)
    refresh = create_refresh_token({"user":user.email},7)
    return token  # Return just the token string, not a dict



def register_new_user(user_data: UserCreate,db: Session):
    user = db.query(User).filter(User.email==user_data.email).first()
    if user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    hashed_pwd = get_hash_password(user_data.password)
    new_user_email = user_data.email.lower()
    new_user=User(name= user_data.name, email=new_user_email, password=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user