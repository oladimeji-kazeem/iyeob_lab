import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import Settings, get_settings


@pytest.fixture
def test_settings() -> Settings:
    return Settings(
        PROJECT_NAME="Ubasify Test API",
        ENVIRONMENT="test",
        DEBUG=False,
    )


@pytest.fixture
def client(test_settings: Settings):
    app.dependency_overrides[get_settings] = lambda: test_settings
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
