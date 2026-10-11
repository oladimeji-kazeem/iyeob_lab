from fastapi.testclient import TestClient


def test_root_health_endpoint(client: TestClient):
    """Verify that root /health returns HTTP 200 and expected payload."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "timestamp" in data
    assert "version" in data
    assert "environment" in data


def test_api_health_endpoint(client: TestClient):
    """Verify that /api/health returns HTTP 200 and expected payload."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_v1_health_endpoint(client: TestClient):
    """Verify that /api/v1/health returns HTTP 200, valid schema, and overridden test settings."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["project"] == "Ubasify Test API"
    assert data["environment"] == "test"
    assert "timestamp" in data
