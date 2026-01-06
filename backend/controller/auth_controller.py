from datetime import UTC, datetime, timedelta
from typing import Annotated
import uuid
from fastapi import HTTPException, status
from jose import jwt, JWTError
from passlib.context import CryptContext
from models.user import AuthIdentity, EmailVerificationToken, RefreshToken, User
from schemas.user import UserCreate
from core.config import settings
from sqlalchemy.orm import Session
import hashlib

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = settings.ALGORITHM
SECRET = settings.SECRET_KEY
REFRESH_SECRET_KEY = settings.REFRESH_KEY

def get_hash_password(password: str):
    return pwd_context.hash(password)

def verify_hash_password(plain_password:str, hash_password:str):
    return pwd_context.verify(plain_password, hash_password)

def hash_token(token: str):
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def create_jwt_token(data:dict, expires_delta:int):
    to_encode = data.copy()
    expire=datetime.now(UTC) + timedelta(minutes=expires_delta)
    to_encode["exp"]=expire
    encoded = jwt.encode(to_encode,SECRET,algorithm=ALGORITHM)
    return encoded

def create_refresh_token(data:dict, expires_delta:int):
    to_encode = data.copy()
    jti = str(uuid.uuid4())
    expire = datetime.now(UTC) + timedelta(days=expires_delta)
    to_encode["jti"]=jti
    to_encode["exp"] = expire
    # Use dictionary access, not object attribute
    encoded_jwt = jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_refresh_token(token:str, db):
    try:
        payload = jwt.decode(token,REFRESH_SECRET_KEY,algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")

    db_token=db.query(RefreshToken).filter(RefreshToken.revoked_at.is_(None), RefreshToken.expired_at > datetime.now()).first()
    if not db_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    return {"user_id":payload.user_id,"user_email":payload.user_email, "db_token":db_token}


def rotate_refresh_token(old_token: str, db: Session):
    if not old_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    hashed_old_token = hash_token(old_token)
    
    db_refresh_token = db.query(RefreshToken).filter(
        RefreshToken.token_hashed == hashed_old_token,
        RefreshToken.revoked_at.is_(None)
    ).first()

    if not db_refresh_token:
        raise HTTPException(status_code=401, detail="Invalid or revoked refresh token")

    db_refresh_token.revoked_at = datetime.now(UTC)
    
    user = db.query(User).filter(User.id == db_refresh_token.user_id).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    new_refresh_token = create_refresh_token(
        {"user_id": str(user.id), "user_email": user.email, "role": "free"}, 7
    )
    new_hashed_token = hash_token(new_refresh_token)
    
    new_db_refresh_token = RefreshToken(
        user_id=user.id, 
        token_hashed=new_hashed_token, 
        expired_at=datetime.now(UTC) + timedelta(days=7)
    )
    
    db.add(new_db_refresh_token)
    db.commit()
    
    new_access_token = create_jwt_token(
        {"user_id": str(user.id), "user_email": user.email, "role": "free"}, 30
    )
    
    return new_refresh_token, new_access_token


def authenticate_user(email:str, password:str, db:Session):
    lower_email = email.lower()
    user = db.query(User).filter(User.email==lower_email).first()
    user_auth_identity = db.query(AuthIdentity).filter(AuthIdentity.user_id == user.id, AuthIdentity.provider=="password").first()
    if not user or not user_auth_identity or not verify_hash_password(password, user_auth_identity.password_hashed):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    token = create_jwt_token({"user_id":str(user.id),"user_email":user.email,"role":"free"},30)
    refresh = create_refresh_token({"user_id":str(user.id),"user_email":user.email,"role":"free"},7)
    
    db_refresh_token=RefreshToken(user_id=user.id,token_hashed=hash_token(refresh),expired_at=datetime.now(UTC)+timedelta(days=7))
    db.add(db_refresh_token)
    db.commit()
    
    return {"token":token,"refresh":refresh} 


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

    plan_token = create_jwt_token({"user_id":str(new_user.user_id),"user_email":new_user.email,"role":"free"},30)
    hashed_token=hash_token(plan_token)
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