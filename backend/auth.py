# auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from database import get_db
from models import User
import os
from pydantic import BaseModel
class UserCreate(BaseModel):
    username: str
    password: str

router = APIRouter()

SECRET_KEY = os.environ["MOVIE_PASS_KEY"]
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ========== Register ==========
@router.post("/register")
async def register_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    username = user.username
    password = user.password

    result = await db.execute(select(User).where(User.username == username))
    if result.scalar():
        raise HTTPException(status_code=400, detail="Username already exists.")

    hashed_password = get_password_hash(password)
    new_user = User(username=username, hashed_password=hashed_password)
    db.add(new_user)
    await db.commit()
    return {"message": "User registered successfully"}

# ========== Login ==========
@router.post("/login")
async def login_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    username = user.username
    password = user.password

    result = await db.execute(select(User).where(User.username == username))
    db_user = result.scalar()
    if not db_user or not verify_password(password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(data={"sub": db_user.username})
    return {"access_token": token, "token_type": "bearer"}

# ========== Current User Helper ==========
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token decode error")

    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user