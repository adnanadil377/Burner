from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from db.session import get_db
from models.user import User, Session as UserSession
from core.config import settings
from sqlalchemy.orm import Session
from datetime import datetime, UTC

ALGORITHM = settings.ALGORITHM
SECRET = settings.SECRET_KEY

oauth2_schema = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: Annotated[str, Depends(oauth2_schema)], db: Session = Depends(get_db)):
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        decoded_user = jwt.decode(token=token, algorithms=[ALGORITHM], key=SECRET)
        email: str = decoded_user.get("user_email")
        session_id: str = decoded_user.get("session_id")
        if email is None:
            raise credentials_exception
    except JWTError as e:
        print(f"JWT Error: {e}")
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    
    # Validate session if session_id is present in token
    if session_id:
        user_session = db.query(UserSession).filter(
            UserSession.id == session_id,
            UserSession.user_id == user.id,
            UserSession.revoked_at.is_(None),
            UserSession.expired_at > datetime.now(UTC)
        ).first()
        
        if not user_session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expired or revoked",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    return user
