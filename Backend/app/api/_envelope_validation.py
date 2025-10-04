import base64
from fastapi import HTTPException

def _b64_ok(s: str) -> bool:
    try:
        base64.b64decode(s.encode(), validate=True)
        return True
    except Exception:
        return False
    
def validate_envelope(env: dict) -> int:
    required = ("v", "kdf", "kdf_params", "salt", "nonce", "ciphertext")
    for r in required:
        if r not in env:
            raise HTTPException(status_code=400, detail=f"Envelope missing required field: {r}")
    if env["kdf"] not in ("scrypt",):
        raise HTTPException(status_code=400, detail=f"Unsupported kdf: {env['kdf']}")
    kp = env["kdf_params"]
    for k in ("n", "r", "p", "dklen"):
        if k not in kp:
            raise HTTPException(status_code=400, detail=f"kdf_params missing: {k}")

    n = int(kp["n"])
    r = int(kp["r"])
    p = int(kp["p"])
    dklen = int(kp["dklen"])
    if not (2**10 <= n <= 2**22):  
        raise HTTPException(status_code=400, detail="kdf_params.n out of range")
    if not (1 <= r <= 16) or not (1 <= p <= 16):
        raise HTTPException(status_code=400, detail="kdf_params.r/p out of range")
    if not (16 <= dklen <= 64):
        raise HTTPException(status_code=400, detail="kdf_params.dklen out of range")

    if not _b64_ok(env["salt"]):  raise HTTPException(status_code=400, detail="salt not base64")
    if not _b64_ok(env["nonce"]): raise HTTPException(status_code=400, detail="nonce not base64")
    if not _b64_ok(env["ciphertext"]): raise HTTPException(status_code=400, detail="ciphertext not base64")

    return len(env["ciphertext"])  