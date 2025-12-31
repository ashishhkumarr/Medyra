from typing import Callable

from app.core.config import settings


class SecurityHeadersMiddleware:
    def __init__(self, app: Callable):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                headers = message.setdefault("headers", [])
                _set_header(headers, b"x-content-type-options", b"nosniff")
                _set_header(headers, b"x-frame-options", b"DENY")
                _set_header(
                    headers,
                    b"referrer-policy",
                    b"strict-origin-when-cross-origin",
                )
                _set_header(
                    headers,
                    b"permissions-policy",
                    b"geolocation=(), camera=(), microphone=(), payment=(), usb=(), "
                    b"interest-cohort=(), accelerometer=(), gyroscope=(), "
                    b"magnetometer=(), midi=(), fullscreen=(), picture-in-picture=()",
                )
                if settings.CSP_ENABLED:
                    _set_header(headers, b"content-security-policy", _build_csp().encode())
                if settings.ENV == "production" and settings.HSTS_ENABLED:
                    _set_header(
                        headers,
                        b"strict-transport-security",
                        b"max-age=31536000; includeSubDomains",
                    )
            await send(message)

        await self.app(scope, receive, send_wrapper)


def _build_csp() -> str:
    return (
        "default-src 'self'; "
        "base-uri 'self'; "
        "frame-ancestors 'none'; "
        "img-src 'self' data:; "
        "font-src 'self' https://fonts.gstatic.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "script-src 'self'; "
        "connect-src 'self'"
    )


def _set_header(headers, name: bytes, value: bytes) -> None:
    headers[:] = [item for item in headers if item[0].lower() != name.lower()]
    headers.append((name, value))
