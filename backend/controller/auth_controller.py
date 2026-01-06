from datetime import UTC, datetime, timedelta
from email.message import EmailMessage
import smtplib
from typing import Annotated
import uuid
from fastapi import HTTPException, Request, Response, status
from jose import jwt, JWTError
from passlib.context import CryptContext
from models.user import AuthIdentity, EmailVerificationToken, RefreshToken, User, Session as UserSession
from schemas.user import UserCreate
from core.config import settings
from sqlalchemy.orm import Session
import hashlib
from fastapi import BackgroundTasks

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = settings.ALGORITHM
SECRET = settings.SECRET_KEY
REFRESH_SECRET_KEY = settings.REFRESH_KEY
EMAIL_ADDRESS=settings.EMAIL_ADDRESS
EMAIL_PASSWORD=settings.EMAIL_PASSWORD
SMTP_SERVER=settings.SMTP_SERVER
SMTP_PORT=settings.SMTP_PORT
FRONTEND_URI=settings.FRONTEND_URI


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
    try:
        payload=jwt.decode(old_token, REFRESH_SECRET_KEY, algorithms=ALGORITHM)
        session_id = payload.get("session_id")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token structure")
    
    if session_id:
        user_session = db.query(UserSession).filter(
            UserSession.id == session_id,
            UserSession.revoked_at.is_(None)
        ).first()
        if not user_session:
            raise HTTPException(status_code=401, detail="Session expired or revoked")
    
    new_payload = {
        "user_id": str(user.id),
        "user_email": user.email,
        "role": "free",
        "session_id": session_id 
    }
    new_refresh_token = create_refresh_token(new_payload,7)
    new_hashed_token = hash_token(new_refresh_token)
    
    new_db_refresh_token = RefreshToken(
        user_id=user.id, 
        token_hashed=new_hashed_token, 
        expired_at=datetime.now(UTC) + timedelta(days=7),
        session_id=session_id  # <--- PASS THIS
    )
    
    db.add(new_db_refresh_token)
    db.commit()
    
    new_access_token = create_jwt_token(new_payload,30)
    
    return new_refresh_token, new_access_token



def authenticate_user(email:str, password:str, db:Session, request: Request):
    lower_email = email.lower()
    user = db.query(User).filter(User.email==lower_email).first()
    user_auth_identity = db.query(AuthIdentity).filter(AuthIdentity.user_id == user.id, AuthIdentity.provider=="password").first()
    if not user or not user_auth_identity or not verify_hash_password(password, user_auth_identity.password_hashed):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    client_ip = request.client.host
    new_session = UserSession(
        user_id=user.id,
        ip_address=client_ip,
        expired_at=datetime.now(UTC) + timedelta(days=7) # Session lasts as long as refresh token
    )
    db.add(new_session)
    db.flush()
    token_payload = {
        "user_id": str(user.id),
        "user_email": user.email,
        "role": "free",
        "session_id": str(new_session.id)
    }
    token = create_jwt_token(token_payload,30)
    refresh = create_refresh_token(token_payload,7)
    
    db_refresh_token=RefreshToken(
        user_id=user.id,
        token_hashed=hash_token(refresh),
        expired_at=datetime.now(UTC)+timedelta(days=7),
        session_id = new_session.id
        )
    db.add(db_refresh_token)
    db.commit()
    
    return {"token":token,"refresh":refresh} 


async def create_new_user(create_user: UserCreate, db: Session, background_tasks: BackgroundTasks):
    normalized_email = create_user.email.lower()
    existing_user = db.query(User).filter(User.email==normalized_email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    hashed_password = get_hash_password(create_user.password)
    new_user = User(email=normalized_email)
    db.add(new_user)
    db.flush()
    
    new_auth_identity = AuthIdentity(user_id=new_user.id, provider="password", provider_user_id=normalized_email, password_hashed=hashed_password)
    db.add(new_auth_identity)
    
    await send_email_verification_token(new_user, db, background_tasks)

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
    

def logout_user(refresh_token, db:Session, response:Response):
    if not refresh_token:
        return {"message": "Logged out"}
    try:
        payload = jwt.decode(refresh_token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        session_id = payload.get("session_id")
        
        if session_id:
            db.query(UserSession).filter(UserSession.id == session_id).update({
                "revoked_at": datetime.now(UTC)
            })
            db.commit()
            
    except Exception:
        pass 
    
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}


async def user_email_verification(email_verification_token:str,user:User, db:Session):
    db_email_token=db.query(EmailVerificationToken).filter(
        EmailVerificationToken.user_id==user.id,
        EmailVerificationToken.token_hashed == hash_token(email_verification_token),
        EmailVerificationToken.revoked_at.is_(None)
    ).first()
    if not db_email_token or db_email_token.expired_at < datetime.now(UTC):        
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not a valid token")
    user.update(email_verified=True)
    
    return {"message":"verified successfully"}

def send_email_async(msg):
    with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.send_message(msg)

async def send_email_verification_token(user: User, db: Session, background_tasks: BackgroundTasks):
    token = create_jwt_token(
        {
            "user_id": str(user.id),
            "user_email": user.email,
            "role": "free"
        },
        30
    )

    token_db = EmailVerificationToken(
        user_id=user.id, 
        token_hashed=hash_token(token),
        expired_at=datetime.now(UTC) + timedelta(minutes=30)
    )
    
    try:
        db.add(token_db)
        db.commit()
        db.refresh(token_db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to generate verification token")
    
    verification_link = f"{FRONTEND_URI}/verify-email?token={token}"

    msg = EmailMessage()
    msg["Subject"] = "Verify Your Email Address"
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = user.email

    msg.set_content(
        f"""
Verify your email address by clicking the link below:

{verification_link}

This link will expire in 30 minutes.
If you didn't request this, you can ignore this email.
"""
    )

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0; padding:0; background:#0a0a0a; font-family:'Inter', -apple-system, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:60px 20px;">
            <table width="480" style="background:#111; padding:40px; border-radius:12px; border:1px solid #222;">
              <tr>
                <td>
                  <h2 style="color:#fff; font-size:24px; font-weight:600; margin:0 0 16px;">Verify Your Email</h2>
                  <p style="color:#888; font-size:15px; line-height:1.6; margin:0 0 32px;">
                    Click the button below to verify your email address and activate your account.
                  </p>

                  <a href="{verification_link}"
                     style="
                        display:inline-block;
                        padding:14px 32px;
                        background:#ff4500;
                        color:#fff;
                        text-decoration:none;
                        font-size:15px;
                        font-weight:600;
                        border-radius:8px;
                        transition:background 0.2s;
                     ">
                    Verify Email
                  </a>

                  <p style="font-size:13px; color:#666; margin:32px 0 24px;">
                    This link expires in <strong style="color:#ff4500">30 minutes</strong>.
                  </p>

                  <hr style="border:none; border-top:1px solid #222; margin:32px 0;">

                  <p style="font-size:12px; color:#555; line-height:1.6;">
                    If the button doesn't work, copy this link:
                    <br />
                    <a href="{verification_link}" style="color:#ff4500; word-break:break-all;">
                      {verification_link}
                    </a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """

    msg.add_alternative(html_content, subtype="html")

    background_tasks.add_task(send_email_async, msg)

    return {"message": "Verification email sent successfully"}