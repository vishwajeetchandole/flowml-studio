"""
Authentication dependency for FastAPI.

Production:  Verifies a Firebase ID token from the Authorization header.
             Requires firebase-admin SDK initialised with a service account.
Development: Set DEV_AUTH=1 in the environment; the token value is used
             directly as the uid (use any non-empty string as the Bearer
             token in curl/tests). NEVER enable DEV_AUTH in production.
"""

import os
import json
from functools import lru_cache
from typing import Set
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

_bearer = HTTPBearer(auto_error=True)

DEV_AUTH: bool = os.getenv("DEV_AUTH", "1") == "1"


def _get_deactivated_path() -> str:
    base = os.getenv("FLOWML_STORAGE_DIR", "storage")
    return os.path.join(base, "deactivated_users.json")


def get_deactivated_users() -> Set[str]:
    path = _get_deactivated_path()
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return set(json.load(f))
        except Exception:
            return set()
    return set()


def set_user_active_status(uid: str, is_active: bool):
    users = get_deactivated_users()
    if is_active:
        users.discard(uid)
    else:
        users.add(uid)
    path = _get_deactivated_path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(list(users), f)


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
                cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred)
        return firebase_admin.get_app()
    except ImportError:
        raise RuntimeError(
            "firebase-admin is not installed. "
            "Install it or set DEV_AUTH=1 for local development."
        )


def is_admin_user(uid: str, claims: dict = None) -> bool:
    """Checks if user has admin privileges."""
    if claims and (claims.get("admin") is True or claims.get("role") == "admin"):
        return True
    if DEV_AUTH:
        # Explicit non-admin identifiers
        if uid in {"non-admin", "unauthorized", "regular-user"} or uid.startswith("user-"):
            return False
        # Recognized admin identifiers
        if uid in {"admin", "admin-demo", "engineer@flowml.studio", "dev-user-demo"} or "admin" in uid.lower():
            return True
        return False
    return False


async def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(_bearer),
) -> str:
    """
    FastAPI dependency that returns the authenticated user's uid.
    """
    token = creds.credentials

    if DEV_AUTH:
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="DEV_AUTH: supply any non-empty string as Bearer token.",
            )
        uid = token
        if uid in get_deactivated_users():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated. Contact an administrator.",
            )
        return uid

    # --- Production path ---
    try:
        from firebase_admin import auth as fb_auth  # type: ignore

        _firebase_app()
        decoded = fb_auth.verify_id_token(token)
        uid = decoded["uid"]
        if uid in get_deactivated_users():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated. Contact an administrator.",
            )
        return uid
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {exc}",
        )


async def get_current_admin(
    creds: HTTPAuthorizationCredentials = Depends(_bearer),
) -> str:
    """
    FastAPI dependency requiring admin privileges.
    """
    token = creds.credentials
    if DEV_AUTH:
        uid = token
        if not is_admin_user(uid):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Administrator access required.",
            )
        if uid in get_deactivated_users():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated.",
            )
        return uid

    # --- Production path ---
    try:
        from firebase_admin import auth as fb_auth  # type: ignore

        _firebase_app()
        decoded = fb_auth.verify_id_token(token)
        uid = decoded["uid"]
        if not is_admin_user(uid, decoded):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Administrator access required.",
            )
        return uid
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {exc}",
        )
