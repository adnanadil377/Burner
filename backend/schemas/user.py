from pydantic import BaseModel, EmailStr
from models.user import User
from uuid import UUID

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password:str

class UserResponse(UserBase):
    id: UUID
    credits: int
    email_verified: bool
    class Config:
        from_attributes=True