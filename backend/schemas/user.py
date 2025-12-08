from pydantic import BaseModel, EmailStr
from models.user import User

class UserBase(BaseModel):
    name:str
    email: EmailStr

class UserCreate(UserBase):
    password:str

class UserRead(UserBase):
    id: int
    class Config:
        from_attributes=True