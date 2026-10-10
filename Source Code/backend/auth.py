"""
Authentication dependency for FastAPI.

Production:  Verifies a Firebase ID token from the Authorization header.
             Requires firebase-admin SDK initialised with a service account.
Development: Set DEV_AUTH=1 in the environment; the token value is used
             directly as the uid (use any non-empty string as the Bearer
             token in curl/tests). NEVER enable DEV_AUTH in production.
"""

import os
from functools import lru_cache
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

_bearer = HTTPBearer(auto_error=True)

DEV_AUTH: bool = os.getenv("DEV_AUTH", "0") == "1"


def _firebase_app():
    """Lazy-init Firebase Admin SDK (only when not in dev mode)."""
    try:
        import firebase_admin  # type: ignore
        from firebase_admin import credentials  # type: ignore

        if not firebase_admin._apps:
            cred_path = os.getenv("FIREBASE_CREDENTIALS", "firebase-credentials.json")
            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
            else:
                # Application Default Credentials (Cloud Run / GKE)
                cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred)
        return firebase_admin.get_app()
    except ImportError:
        raise RuntimeError(
            "firebase-admin is not installed. "
            "Install it or set DEV_AUTH=1 for local development."
        )


async def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(_bearer),
) -> str:
    """
    FastAPI dependency that returns the authenticated user's uid.

    Usage:
        @router.post("/some-endpoint")
        async def handler(uid: str = Depends(get_current_user)):
            ...
    """
    token = creds.credentials

    if DEV_AUTH:
        # In dev mode the raw token value IS the uid.
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="DEV_AUTH: supply any non-empty string as Bearer token.",
            )
        return token

    # --- Production path ---
    try:
        from firebase_admin import auth as fb_auth  # type: ignore

        _firebase_app()  # ensure initialised
        decoded = fb_auth.verify_id_token(token)
        return decoded["uid"]
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {exc}",
        )
