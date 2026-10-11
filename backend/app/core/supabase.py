from functools import lru_cache
import logging
from typing import Optional
from supabase import Client, create_client
from app.core.config import get_settings

logger = logging.getLogger("uvicorn.error")


class SupabaseManager:
    """Manages the lifecycle of Supabase client connections."""

    def __init__(self):
        self.settings = get_settings()
        self._client: Optional[Client] = None

    @property
    def client(self) -> Client:
        if self._client is None:
            key = self.settings.SUPABASE_SERVICE_ROLE_KEY or self.settings.SUPABASE_KEY
            try:
                self._client = create_client(self.settings.SUPABASE_URL, key)
                logger.info(
                    "Connected to Supabase project %s at %s",
                    self.settings.SUPABASE_PROJECT_ID,
                    self.settings.SUPABASE_URL,
                )
            except Exception as e:
                logger.warning("Failed to initialize Supabase client: %s", e)
                # Fallback empty client creation if parameters allow
                self._client = create_client(self.settings.SUPABASE_URL, self.settings.SUPABASE_KEY)
        return self._client


@lru_cache
def get_supabase_manager() -> SupabaseManager:
    return SupabaseManager()


def get_supabase_client() -> Client:
    """Dependency provider for FastAPI route endpoints."""
    return get_supabase_manager().client
