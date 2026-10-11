from app.core.config import Settings


def test_default_settings():
    """Verify default settings configuration."""
    settings = Settings()
    assert settings.VERSION == "0.1.0"
    assert settings.PORT == 5000
    assert "http://localhost:3000" in settings.CORS_ORIGINS


def test_custom_settings_override():
    """Verify that settings can be cleanly initialized with custom overrides."""
    custom = Settings(
        PROJECT_NAME="Custom Platform",
        ENVIRONMENT="production",
        PORT=8000,
        DEBUG=False,
    )
    assert custom.PROJECT_NAME == "Custom Platform"
    assert custom.ENVIRONMENT == "production"
    assert custom.PORT == 8000
    assert custom.DEBUG is False


def test_cors_origins_parsing():
    """Verify CORS origins field parsing from string and list."""
    settings_str = Settings(CORS_ORIGINS="http://site-a.com, http://site-b.com")
    assert settings_str.CORS_ORIGINS == ["http://site-a.com", "http://site-b.com"]

    settings_json = Settings(CORS_ORIGINS='["http://site-c.com"]')
    assert settings_json.CORS_ORIGINS == ["http://site-c.com"]
