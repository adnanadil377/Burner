from datetime import UTC, datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = settings.ALGORITHM
SECRET = settings.SECRET_KEY

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_pass(hash_password:str, password:str):
    return pwd_context.verify(password, hash_password)

def create_jwt_token(data:dict, expires_delta:timedelta):
    to_encode = data.copy()
    print(type(expires_delta))
    expire=datetime.now(UTC) + timedelta(minutes=30)
    to_encode["exp"]=expire
    encoded = jwt.encode(to_encode,SECRET,algorithm=ALGORITHM)
    print(encoded)
    return encoded

def get_user_data(token:str):
    decoded_user=jwt.decode(token=token,algorithms=ALGORITHM,key=SECRET)
    print(decoded_user)
    return decoded_user
