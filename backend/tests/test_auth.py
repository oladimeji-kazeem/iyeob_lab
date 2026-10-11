from uuid import uuid4
from fastapi.testclient import TestClient


def test_auth_full_security_lifecycle(client: TestClient):
    # 1. Registration
    email = f"auth_user_{uuid4().hex[:8]}@example.com"
    original_password = "InitialPassword123!"

    signup_res = client.post(
        "/api/v1/auth/signup",
        json={
            "email": email,
            "password": original_password,
            "full_name": "Security Lifecycle User",
        },
    )
    assert signup_res.status_code == 201
    auth_data = signup_res.json()
    assert "access_token" in auth_data
    access_token = auth_data["access_token"]
    assert auth_data["user"]["email"] == email

    # 2. Verify Session via /auth/me with Bearer token
    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert me_res.status_code == 200
    principal = me_res.json()
    assert principal["user"]["email"] == email

    # 3. Unauthenticated access to /auth/me fails
    unauth_res = client.get("/api/v1/auth/me")
    assert unauth_res.status_code == 401

    # 4. Login with correct credentials
    login_res = client.post(
        "/api/v1/auth/signin",
        json={"email": email, "password": original_password},
    )
    assert login_res.status_code == 200
    new_token = login_res.json()["access_token"]

    # 5. Login with invalid password fails (401)
    bad_login = client.post(
        "/api/v1/auth/signin",
        json={"email": email, "password": "WrongPassword999!"},
    )
    assert bad_login.status_code == 401

    # 6. Logout / Invalidate Session Token
    logout_res = client.post(
        "/api/v1/auth/signout",
        headers={"Authorization": f"Bearer {new_token}"},
    )
    assert logout_res.status_code == 200

    # 7. Accessing /auth/me with revoked token now fails (401)
    revoked_access = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {new_token}"},
    )
    assert revoked_access.status_code == 401


def test_password_recovery_and_reset_flow(client: TestClient):
    email = f"recovery_{uuid4().hex[:8]}@example.com"
    old_password = "OldSecretPassword123!"
    new_password = "BrandNewSecurePassword456!"

    # 1. Register user
    signup_res = client.post(
        "/api/v1/auth/signup",
        json={"email": email, "password": old_password, "full_name": "Recovery Tester"},
    )
    assert signup_res.status_code == 201

    # 2. Request Password Recovery
    recovery_res = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": email},
    )
    assert recovery_res.status_code == 200
    recovery_data = recovery_res.json()
    assert "reset_token" in recovery_data
    reset_token = recovery_data["reset_token"]
    assert reset_token is not None

    # 3. Confirm Password Reset with token
    reset_res = client.post(
        "/api/v1/auth/reset-password",
        json={"token": reset_token, "new_password": new_password},
    )
    assert reset_res.status_code == 200
    assert "successfully reset" in reset_res.json()["message"]

    # 4. Old password can no longer sign in
    old_signin = client.post(
        "/api/v1/auth/signin",
        json={"email": email, "password": old_password},
    )
    assert old_signin.status_code == 401

    # 5. New password can successfully sign in
    new_signin = client.post(
        "/api/v1/auth/signin",
        json={"email": email, "password": new_password},
    )
    assert new_signin.status_code == 200
    assert "access_token" in new_signin.json()

    # 6. Reusing the reset token should fail (token single-use)
    reused_reset = client.post(
        "/api/v1/auth/reset-password",
        json={"token": reset_token, "new_password": "AnotherPassword789!"},
    )
    assert reused_reset.status_code == 400


def test_recovery_for_nonexistent_email():
    from app.main import app
    from fastapi.testclient import TestClient

    with TestClient(app) as test_client:
        res = test_client.post(
            "/api/v1/auth/forgot-password",
            json={"email": "nonexistent_email_xyz@test.com"},
        )
        assert res.status_code == 200
        # reset_token is None to prevent enumeration
        assert res.json()["reset_token"] is None
