from typing import Optional
from fastapi import APIRouter, Depends, Header, HTTPException, status, UploadFile, File, Form, Body
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import json, base64
import io
import hashlib
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag

from ..db import get_db
from ..repositories import FileRepo, UserRepo
from ..schemas import FileUploadRequest, FileListResponse, FileMeta, FileEnvelopeResponse
from ..security.tokens import decode_token
from ._envelope_validation import validate_envelope

router = APIRouter(prefix="/files", tags=["Files"])

def _current_user(authorization: Optional[str], db: Session) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1].strip()
    data = decode_token(token)
    if not data or data.get("stage") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    username = data.get("sub")
    user = UserRepo(db).by_username(username)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user 

@router.post("/upload", response_model=FileMeta, status_code=201)
def upload_file(body: FileUploadRequest, db: Session = Depends(get_db), authorization: Optional[str] = Header(None)):
    user = _current_user(authorization, db)
    size_bytes = validate_envelope(body.envelope_json)
    rec = FileRepo(db).create(owner_id=user.id, filename_original=body.filename, envelope_json=body.envelope_json, size_bytes=size_bytes)
    return { "id": rec.id, "message": "uploaded"}

@router.get("/", response_model=FileListResponse)
def list_files(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    user = _current_user(authorization, db)
    items = FileRepo(db).list_by_owner(user.id)
    return FileListResponse(
        files=[FileMeta(id=i.id, filename_original=i.filename_original, size_bytes=i.size_bytes, created_at=i.created_at) for i in items]
    )

@router.get("/{file_id}", response_model=FileEnvelopeResponse)
def get_file(file_id: int, authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    user = _current_user(authorization, db)
    rec = FileRepo(db).by_id_owner(file_id, user.id)
    if not rec:
        raise HTTPException(status_code=404, detail="File not found")
    env = json.loads(rec.envelope_json)
    return FileEnvelopeResponse(id=rec.id, filename_original=rec.filename_original, envelope_json=env, size_bytes=rec.size_bytes, created_at=rec.created_at)

@router.post("/upload-multipart", status_code=201)
async def upload_multipart(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
    filename_original: str = Form(...),
    v: int = Form(...),
    kdf: str = Form(...),
    kdf_params: str = Form(...),  # JSON em string
    salt: str = Form(...),
    nonce: str = Form(...),
    file: UploadFile = File(...),  # ciphertext binário
):

    user = _current_user(authorization, db)

    ciphertext_bytes = await file.read()
    ciphertext_b64 = base64.b64encode(ciphertext_bytes).decode()

    try:
        kdfp = json.loads(kdf_params)
    except Exception:
        raise HTTPException(status_code=400, detail="kdf_params must be valid JSON")

    envelope = {
        "v": v,
        "kdf": kdf,
        "kdf_params": kdfp,
        "salt": salt,
        "nonce": nonce,
        "ciphertext": ciphertext_b64,
    }

    size_bytes = validate_envelope(envelope)

    rec = FileRepo(db).create(
        owner_id=user.id,
        filename_original=filename_original,
        envelope_json=envelope,
        size_bytes=size_bytes,
    )
    return {"id": rec.id, "message": "uploaded: ", "filename_original": filename_original}

@router.get("/download/{file_id}")
@router.get("/download/{file_id}", response_model=FileEnvelopeResponse)
def download_envelope(file_id: int, authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """
    Retorna o envelope criptografado para que o cliente possa realizar a decriptação local.
    """
    user = _current_user(authorization, db)
    rec = FileRepo(db).by_id_owner(file_id, user.id)
    if not rec:
        raise HTTPException(status_code=404, detail="File not found")

    try:
        env = json.loads(rec.envelope_json)
    except Exception:
        raise HTTPException(status_code=500, detail="Invalid envelope format")

    return FileEnvelopeResponse(
        id=rec.id,
        filename_original=rec.filename_original,
        envelope_json=env,
        size_bytes=rec.size_bytes,
        created_at=rec.created_at
    )