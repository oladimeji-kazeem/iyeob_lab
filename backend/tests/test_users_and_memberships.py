from uuid import uuid4
from fastapi.testclient import TestClient


def test_list_and_create_user(client: TestClient):
    res = client.get("/api/v1/users")
    assert res.status_code == 200
    users = res.json()
    assert len(users) >= 3

    unique_email = f"user_{uuid4().hex[:8]}@example.com"
    payload = {
        "email": unique_email,
        "full_name": "Test Student User",
        "avatar_url": "https://example.com/avatar.jpg",
    }
    create_res = client.post("/api/v1/users", json=payload)
    assert create_res.status_code == 201
    created = create_res.json()
    assert "id" in created
    assert created["email"] == unique_email
    assert "created_at" in created
    assert "updated_at" in created


def test_memberships_lifecycle(client: TestClient):
    # 1. Fetch seed user and institution
    users_res = client.get("/api/v1/users")
    user_id = users_res.json()[0]["id"]
    inst_res = client.get("/api/v1/institutions")
    inst2_id = [i for i in inst_res.json() if i["code"] == "LPA"][0]["id"]

    # 2. Assign membership in LPA
    mem_payload = {
        "user_id": user_id,
        "institution_id": inst2_id,
        "role": "lecturer",
        "status": "active",
    }
    create_mem = client.post("/api/v1/memberships", json=mem_payload)
    assert create_mem.status_code == 201
    mem_data = create_mem.json()
    assert mem_data["role"] == "lecturer"
    assert "created_at" in mem_data

    # 3. Duplicate assignment rejected
    dup_res = client.post("/api/v1/memberships", json=mem_payload)
    assert dup_res.status_code == 409

    # 4. Filter memberships by institution
    list_res = client.get(f"/api/v1/memberships?institution_id={inst2_id}")
    assert list_res.status_code == 200
    assert any(m["id"] == mem_data["id"] for m in list_res.json())
