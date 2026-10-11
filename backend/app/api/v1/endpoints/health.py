from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.config import Settings, get_settings

router = APIRouter()


class HealthCheckResponse(BaseModel):
    status: str
    project: str
    version: str
    environment: str
    timestamp: str


@router.get("/health", response_model=HealthCheckResponse, summary="Service Health Check")
def get_health_status(settings: Settings = Depends(get_settings)) -> HealthCheckResponse:
    """Returns the operational health and environment metadata of the API service."""
    return HealthCheckResponse(
        status="ok",
        project=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
