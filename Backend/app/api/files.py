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

@router.post("/{file_id}/download-decrypted")
def download_decrypted(
    file_id: int,
    body: dict = Body(...),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
  
    user = _current_user(authorization, db)

    pwd = body.get("password") if isinstance(body, dict) else None
    if not pwd:
        raise HTTPException(status_code=400, detail="Missing 'password' in request body")

    rec = FileRepo(db).by_id_owner(file_id, user.id)
    if not rec:
        raise HTTPException(status_code=404, detail="File not found")

    # Envelope might be stored as JSON string or already as dict depending on create path
    try:
        env = rec.envelope_json
        if isinstance(env, str):
            env = json.loads(env)
    except Exception:
        raise HTTPException(status_code=500, detail="Malformed envelope stored")

    # Validate envelope structure
    try:
        kdf = env.get("kdf")
        kdf_params = env.get("kdf_params", {})
        salt_b64 = env.get("salt")
        nonce_b64 = env.get("nonce")
        ciphertext_b64 = env.get("ciphertext")
        if not all([kdf, salt_b64, nonce_b64, ciphertext_b64]):
            raise ValueError("Incomplete envelope")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid envelope format")

    if kdf != "scrypt":
        raise HTTPException(status_code=400, detail="Unsupported KDF; expected 'scrypt'")

    try:
        salt = base64.b64decode(salt_b64)
        nonce = base64.b64decode(nonce_b64)
        ciphertext = base64.b64decode(ciphertext_b64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 in envelope")

    # Derive key using scrypt parameters from envelope (provide sensible defaults if missing)
    try:
        n = int(kdf_params.get("n", 2**14))
        r = int(kdf_params.get("r", 8))
        p = int(kdf_params.get("p", 1))
        dklen = int(kdf_params.get("dklen", 32))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid kdf_params")

    try:
        key = hashlib.scrypt(password=pwd.encode("utf-8"), salt=salt, n=n, r=r, p=p, dklen=dklen)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"KDF failed: {str(e)}")

    # Decrypt with AES-GCM
    try:
        aesgcm = AESGCM(key)
        plaintext = aesgcm.decrypt(nonce, ciphertext, None)
    except InvalidTag:
        raise HTTPException(status_code=400, detail="Decryption failed: invalid password or corrupted data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decryption error: {str(e)}")

    # Return plaintext as a downloadable stream
    buffer = io.BytesIO(plaintext)
    buffer.seek(0)
    filename = rec.filename_original or f"file_{rec.id}"
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return StreamingResponse(buffer, media_type="application/octet-stream", headers=headers)

@router.post("/upload-multipart", status_code=201)
async def upload_multipart(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
    filename: str = Form(...),
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
        filename_original=filename,
        envelope_json=envelope,
        size_bytes=size_bytes,
    )
    return {"id": rec.id, "message": "uploaded: ", "filename": filename}