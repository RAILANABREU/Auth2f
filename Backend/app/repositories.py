import json
from sqlalchemy.orm import Session
from typing import List, Optional
from .models import User, File

class UserRepo:
    def __init__(self, db:Session):
        self.db = db

    def by_username(self, username:str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()
    
    def create(self, username:str, pw_hash:str, totp_secret:str) -> User:
        u = User(
            username=username,
            pw_hash=pw_hash,
            totp_secret=totp_secret
        )
        self.db.add(u)
        self.db.commit()
        self.db.refresh(u)
        return u
    
class FileRepo:
    def __init__(self, db:Session):
        self.db = db

    def create(self, owner_id:int, filename_original:str, envelope_json:dict, size_bytes:int) -> File:
        rec = File(
            owner_id=owner_id,
            filename_original=filename_original,
            envelope_json=json.dumps(envelope_json),
            size_bytes=size_bytes
        )
        self.db.add(rec)
        self.db.commit()
        self.db.refresh(rec)
        return rec
    def list_by_owner(self, owner_id:int) -> List[File]:
        return self.db.query(File).filter(File.owner_id == owner_id).order_by(File.created_at.desc()).all()
    
    def by_id_owner(self, file_id:int, owner_id:int) -> Optional[File]:
        return self.db.query(File).filter(File.id == file_id, File.owner_id == owner_id).first()