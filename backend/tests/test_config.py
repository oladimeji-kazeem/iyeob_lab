from app.core.config import Settings


def test_default_settings():
    """Verify default settings configuration."""
    settings = Settings()
    assert settings.VERSION == "0.1.0"
    assert settings.PORT == 5000
    assert "http://localhost:3000" in settings.CORS_ORIGINS
    assert settings.POSTGRES_SERVER == "localhost"
    assert settings.POSTGRES_PORT == 5432
    assert settings.POSTGRES_USER == "postgres"
    assert settings.POSTGRES_DB == "iyeob_lab"
    assert "postgresql://postgres:postgres@localhost:5432/iyeob_lab" == settings.database_uri


def test_custom_settings_override():
    """Verify that settings can be cleanly initialized with custom overrides."""
    custom = Settings(
        PROJECT_NAME="Custom Platform",
        ENVIRONMENT="production",
        PORT=8000,
        DEBUG=False,
        POSTGRES_SERVER="db-cluster",
        POSTGRES_PORT=5433,
        POSTGRES_USER="app_user",
        POSTGRES_PASSWORD="secret_password",
        POSTGRES_DB="app_db",
    )
    assert custom.PROJECT_NAME == "Custom Platform"
    assert custom.ENVIRONMENT == "production"
    assert custom.PORT == 8000
    assert custom.DEBUG is False
    assert (
        custom.database_uri
        == "postgresql://app_user:secret_password@db-cluster:5433/app_db"
    )


def test_custom_database_url_override():
    """Verify that explicit DATABASE_URL overrides individual credentials."""
    custom = Settings(DATABASE_URL="postgresql+asyncpg://admin:pass@remote-host:5432/prod_db")
    assert custom.database_uri == "postgresql+asyncpg://admin:pass@remote-host:5432/prod_db"


def test_cors_origins_parsing():
    """Verify CORS origins field parsing from string and list."""
    settings_str = Settings(CORS_ORIGINS="http://site-a.com, http://site-b.com")
    assert settings_str.CORS_ORIGINS == ["http://site-a.com", "http://site-b.com"]

    settings_json = Settings(CORS_ORIGINS='["http://site-c.com"]')
    assert settings_json.CORS_ORIGINS == ["http://site-c.com"]
