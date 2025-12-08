from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from controller.user_controller import create_user, get_users
from db.session import get_db
from schemas.user import UserCreate


router = APIRouter()

@router.post("/")
def add_user(user:UserCreate, db:Session = Depends(get_db)):
    return create_user(db,user)

@router.get("/")
def list_users(db:Session=Depends(get_db)):
    return get_users(db)