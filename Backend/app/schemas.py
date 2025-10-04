from typing import List, Dict
from pydantic import BaseModel, Field

#AUTH

class RegisterRequest(BaseModel):
    username: str = Field( min_length=3, max_length=64)
    password: str = Field(min_length=5)

class RegisterResponse(BaseModel):
    message: str
    otpauth_uri: str

class LoginRequest(BaseModel):
    username: str
    password: str

class Pre2FAToken(BaseModel):
    token: str
    token_type: str = "pre2fa"

class Verify2FARequest(BaseModel):
    pre2fa_token: str
    totp_code: str 

class AccessToken(BaseModel):
    access_token: str
    token_type: str = "bearer"

#FILES

class FileUploadRequest(BaseModel):
    filename: str
    envelope_json: Dict 

class FileMeta(BaseModel):
    id: int
    filename_original: str
    size_bytes: int

class FileListResponse(BaseModel):
    files: List[FileMeta]

class FileEnvelopeResponse(BaseModel):
    id: int
    filename_original: str
    envelope_json: Dict