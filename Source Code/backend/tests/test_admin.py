"""
Tests for Phase 3: Admin router and security governance.
"""

import pytest
from fastapi.testclient import TestClient

from app import app
from auth import set_user_active_status


def test_non_admin_forbidden():
    """Non-admin user must receive 403 Forbidden on admin endpoints."""
    client = TestClient(app)
    resp = client.get(
        "/api/admin/users",
        headers={"Authorization": "Bearer non-admin"},
    )
    assert resp.status_code == 403
    assert "Administrator access required" in resp.json()["detail"]


def test_admin_list_users():
    """Admin user can view users list."""
    client = TestClient(app)
    resp = client.get(
        "/api/admin/users",
        headers={"Authorization": "Bearer admin"},
    )
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_admin_system_metrics():
    """Admin user can view CPU/RAM/Storage system metrics."""
    client = TestClient(app)
    resp = client.get(
        "/api/admin/system",
        headers={"Authorization": "Bearer admin"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "storage" in data
    assert "memory" in data
    assert "platform" in data


def test_admin_limits_get_and_update():
    """Admin user can inspect and update configurable system limits."""
    client = TestClient(app)
    # Get limits
    resp = client.get(
        "/api/admin/limits",
        headers={"Authorization": "Bearer admin"},
    )
    assert resp.status_code == 200
    assert "execution_timeout_sec" in resp.json()

    # Update limits
    new_limits = {
        "execution_timeout_sec": 20,
        "memory_limit_mb": 512,
        "max_upload_size_mb": 75,
        "per_user_quota_datasets": 30,
    }
    update_resp = client.post(
        "/api/admin/limits",
        json=new_limits,
        headers={"Authorization": "Bearer admin"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["execution_timeout_sec"] == 20


def test_admin_deactivate_and_reactivate_user():
    """Admin can deactivate user; deactivated user cannot access API."""
    client = TestClient(app)
    target_uid = "user_victim_123"

    # Deactivate user
    resp = client.post(
        f"/api/admin/users/{target_uid}/status",
        json={"active": False},
        headers={"Authorization": "Bearer admin"},
    )
    assert resp.status_code == 200
    assert resp.json()["is_active"] is False

    # Target user is now blocked with 403 Forbidden
    blocked_resp = client.get(
        "/api/datasets",
        headers={"Authorization": f"Bearer {target_uid}"},
    )
    assert blocked_resp.status_code == 403
    assert "deactivated" in blocked_resp.json()["detail"].lower()

    # Reactivate user
    unblock_resp = client.post(
        f"/api/admin/users/{target_uid}/status",
        json={"active": True},
        headers={"Authorization": "Bearer admin"},
    )
    assert unblock_resp.status_code == 200
    assert unblock_resp.json()["is_active"] is True
