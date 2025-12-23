from datetime import UTC, datetime, timedelta
from typing import Annotated
from fastapi import HTTPException, status
from jose import jwt, JWTError
from passlib.context import CryptContext
from models.user import AuthIdentity, EmailVerificationToken, User
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
    user_auth_identity = db.query(AuthIdentity).filter(AuthIdentity.user_id == user.id, AuthIdentity.provider=="password").first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    if not verify_password(password,user_auth_identity.password_hashed):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    token = create_jwt_token({"user":user.email},30)
    refresh = create_refresh_token({"user":user.email},7)
    return token  # Return just the token string, not a dict


def create_new_user(create_user: UserCreate,db: Session):
    normalized_email = create_user.email.lower()
    existing_user = db.query(User).filter(User.email==normalized_email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    hashed_password = get_hash_password(create_user.password)
    new_user = User(email=normalized_email)
    db.add(new_user)
    db.flush()
    
    new_auth_identity = AuthIdentity(user_id=new_user.id, provider="password", provider_user_id=normalized_email, password_hashed=hashed_password )
    db.add(new_auth_identity)

    plan_token = create_jwt_token({"user":str(new_user.id)},30)
    hashed_token=get_hash_password(plan_token)
    verification_token = EmailVerificationToken(user_id=new_user.id, token_hashed=hashed_token, expired_at=datetime.now(UTC) + timedelta(minutes=30))
    db.add(verification_token)

    try:
        db.commit()
        db.refresh(new_user)
        return new_user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Signup failed"
        )