from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class CourseOfferingBase(BaseModel):
    semester: str = Field(..., min_length=2, max_length=50, description="Offering semester term, e.g. Fall 2026")
    price_cents: int = Field(0, ge=0, description="Per-semester enrollment fee in cents (0 for free)")
    capacity: int = Field(100, ge=1, le=10000, description="Maximum student enrollment capacity")
    is_open: bool = Field(True, description="Whether registration is currently open")


class CourseOfferingCreate(CourseOfferingBase):
    template_id: UUID = Field(..., description="Foreign key reference to course_templates(id)")
    institution_id: UUID = Field(..., description="Foreign key reference to institutions(id)")
    lecturer_id: Optional[UUID] = Field(None, description="Assigned lecturer user UUID reference to users(id)")


class CourseOfferingUpdate(BaseModel):
    semester: Optional[str] = Field(None, min_length=2, max_length=50)
    lecturer_id: Optional[UUID] = None
    price_cents: Optional[int] = Field(None, ge=0)
    capacity: Optional[int] = Field(None, ge=1, le=10000)
    is_open: Optional[bool] = None


class CourseOfferingResponse(CourseOfferingBase):
    id: UUID
    template_id: UUID
    institution_id: UUID
    lecturer_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
