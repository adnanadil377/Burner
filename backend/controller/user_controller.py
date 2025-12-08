from sqlalchemy.orm import Session
from models.user import User
from schemas.user import UserCreate

def create_user(db:Session, user:UserCreate):
    db_user = User(name=user.name, email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db:Session):
    users= db.query(User).all()
    return users