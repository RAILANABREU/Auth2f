import hashlib
import hmac
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

def _pbkdf2(password: str, salt: bytes, iterations: int = 10000, length: int = 32) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=length,
        salt=salt,
        iterations=iterations,
    )
    return kdf.derive(password.encode("utf-8"))

def make_salt(username: str, password: str) -> bytes:
    combo = f"{username}:{password}".encode("utf-8")
    return hashlib.sha256(combo).digest()

def make_password_hash(username: str, password: str) -> str:
    salt = make_salt(username, password)
    key = _pbkdf2(password, salt)
    return key.hex()

def verify_password(username: str, password: str, hash_hex: str) -> bool:
    salt = make_salt(username, password)
    key2 = _pbkdf2(password, salt)
    return hmac.compare_digest(key2.hex(), hash_hex)