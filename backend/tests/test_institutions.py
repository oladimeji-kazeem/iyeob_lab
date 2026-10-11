from uuid import uuid4
from fastapi.testclient import TestClient


def test_list_institutions(client: TestClient):
    response = client.get("/api/v1/institutions")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2
    assert any(inst["code"] == "MIPT" for inst in data)


def test_create_and_get_institution(client: TestClient):
    new_code = f"TEST_{uuid4().hex[:6].upper()}"
    payload = {
        "name": "Global Laboratory Institute",
        "code": new_code,
        "domain": f"{new_code.lower()}.edu",
        "is_active": True,
    }
    create_res = client.post("/api/v1/institutions", json=payload)
    assert create_res.status_code == 201
    created = create_res.json()
    assert "id" in created
    assert created["code"] == new_code
    assert "created_at" in created
    assert "updated_at" in created

    # Test get by ID
    get_res = client.get(f"/api/v1/institutions/{created['id']}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == payload["name"]


def test_duplicate_institution_code_rejected(client: TestClient):
    payload = {
        "name": "Duplicate Institute",
        "code": "MIPT",  # Already seeded
        "domain": "dup.edu",
        "is_active": True,
    }
    res = client.post("/api/v1/institutions", json=payload)
    assert res.status_code == 409
