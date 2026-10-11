from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class InstitutionBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Full institution name")
    code: str = Field(..., min_length=2, max_length=50, description="Unique institution identifier code")
    domain: Optional[str] = Field(None, max_length=255, description="Associated academic web domain")
    is_active: bool = Field(True, description="Whether the institution is active")


class InstitutionCreate(InstitutionBase):
    pass


class InstitutionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    code: Optional[str] = Field(None, min_length=2, max_length=50)
    domain: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None


class InstitutionResponse(InstitutionBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
