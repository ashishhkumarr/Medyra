from fastapi import Request
from slowapi import Limiter


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


def get_ip_email_key(request: Request) -> str:
    email = getattr(request.state, "normalized_email", None)
    ip = get_client_ip(request)
    if email:
        return f"{ip}:{email}"
    return ip


limiter = Limiter(key_func=get_client_ip)
