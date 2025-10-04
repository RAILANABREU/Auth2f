from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db import get_db
from ..repositories import UserRepo
from ..schemas import (RegisterRequest,RegisterResponse, LoginRequest, Pre2FAToken, Verify2FARequest, AccessToken)
from ..security.password import (make_password_hash,verify_password)
from ..security.tokens import ( create_token, decode_token)
from ..security.totp import (generate_totp_secret, make_otpauth_uri, verify_totp_code)
from ..config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=RegisterResponse,status_code=201)
def register(body:RegisterRequest, db:Session=Depends(get_db)):
    users = UserRepo(db)
    if users.by_username(body.username):
        raise HTTPException(status_code=400, detail="Username already exists")
    pw_hash = make_password_hash(body.username, body.password)
    secret = generate_totp_secret()
    users.create(body.username, pw_hash, secret)
    otpauth_uri = make_otpauth_uri(body.username, secret, issuer=settings.APP_NAME)
    return RegisterResponse(message="User registered. Add this TOTP to your authenticator.", otpauth_uri=otpauth_uri)

@router.post("/login", response_model=Pre2FAToken)
def login(body:LoginRequest, db:Session=Depends(get_db)):
    users = UserRepo(db)
    user = users.by_username(body.username)
    if not user or not verify_password(body.username, body.password, user.pw_hash):        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_token(sub=user.username, stage="pre2fa", minutes=settings.PRE2FA_TOKEN_EXPIRE_MINUTES)
    return Pre2FAToken(token=token)

@router.post("/verify-2fa", response_model=AccessToken)
def verify_2fa(body: Verify2FARequest, db: Session = Depends(get_db)):
    data = decode_token(body.pre2fa_token)
    if not data or data.get("stage") != "pre2fa":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid pre2fa token")
    username = data.get("sub")
    users = UserRepo(db)
    user = users.by_username(username)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if not verify_totp_code(user.totp_secret, body.totp_code):
        raise HTTPException(status_code=401, detail="Invalid TOTP code")
    access = create_token(sub=user.username, stage="access", minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return AccessToken(access_token=access)
