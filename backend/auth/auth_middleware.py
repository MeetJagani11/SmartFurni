from fastapi import HTTPException, Depends, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import os
from models.user import User
from database import get_database

db = get_database()

# Security configuration (duplicated for simplicity or moved to a config later)
SECRET_KEY = os.environ.get("JWT_SECRET", "dev_secret_key")
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = await db.users.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return User(**user)

async def get_optional_current_user(request: Request):
    """
    Optional authentication that doesn't block the request if token is missing or invalid.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        
        user = await db.users.find_one({"email": email})
        if user is None:
            return None
        return User(**user)
    except JWTError:
        return None

async def get_current_admin_user(current_user: User = Depends(get_current_user)):
    print(f"ADMIN_CHECK: User={current_user.email}, is_admin={current_user.is_admin}")
    
    # Bypass for debugging or explicit allow
    if current_user.email == 'meetjagani1107@gmail.com':
        return current_user
        
    if not current_user.is_admin:
        print(f"ADMIN_CHECK_FAILED: {current_user.email} is not an admin")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user
