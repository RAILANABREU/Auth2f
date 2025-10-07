import pyotp

def generate_totp_secret() -> str:
    return pyotp.random_base32()

def make_otpauth_uri(username: str, secret: str, issuer: str) -> str:
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=username, issuer_name=issuer)

def verify_totp_code(secret: str, code: str) -> bool:
    return pyotp.TOTP(secret).verify(code, valid_window=1)