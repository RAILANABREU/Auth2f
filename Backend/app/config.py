import os 
from dataclasses import dataclass

@dataclass(frozen=True)
class Settings:
    APP_NAME: str = "Authentication Service"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your_default_secret_key")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
    PRE2FA_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("PRE2FA_TOKEN_EXPIRE_MINUTES", "5"))
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./auth2f.db")
    FILE_STORAGE_DIR: str = os.getenv("FILE_STORAGE_DIR", "./storage")

settings = Settings()