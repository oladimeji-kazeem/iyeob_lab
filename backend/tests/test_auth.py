from uuid import uuid4
from fastapi.testclient import TestClient


def test_auth_signup_and_signin_flow(client: TestClient):
    unique_email = f"auth_test_{uuid4().hex[:8]}@example.com"
    signup_payload = {
        "email": unique_email,
        "password": "SecretPassword123!",
        "full_name": "Auth Tester",
    }
    signup_res = client.post("/api/v1/auth/signup", json=signup_payload)
    assert signup_res.status_code == 201
    auth_data = signup_res.json()
    assert "access_token" in auth_data
    assert auth_data["user"]["email"] == unique_email

    # Test Sign In
    signin_payload = {
        "email": unique_email,
        "password": "SecretPassword123!",
    }
    signin_res = client.post("/api/v1/auth/signin", json=signin_payload)
    assert signin_res.status_code == 200
    assert "access_token" in signin_res.json()

    # Test Sign Out
    signout_res = client.post("/api/v1/auth/signout")
    assert signout_res.status_code == 200
    assert "Successfully" in signout_res.json()["message"]


def test_signin_invalid_credentials(client: TestClient):
    res = client.post(
        "/api/v1/auth/signin",
        json={"email": "nonexistent_user_999@test.com", "password": "wrong"},
    )
    assert res.status_code == 401
