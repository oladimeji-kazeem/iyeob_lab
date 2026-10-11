from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class CourseTemplateBase(BaseModel):
    code: str = Field(..., min_length=2, max_length=50, description="Unique curriculum course code, e.g. CS101")
    title: str = Field(..., min_length=2, max_length=255, description="Course template title")
    description: Optional[str] = Field(None, description="Detailed syllabus and learning outcomes")
    credits: int = Field(3, ge=1, le=30, description="Academic credits earned upon completion")
    syllabus_json: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Curriculum modules and syllabus details")


class CourseTemplateCreate(CourseTemplateBase):
    pass


class CourseTemplateUpdate(BaseModel):
    code: Optional[str] = Field(None, min_length=2, max_length=50)
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    credits: Optional[int] = Field(None, ge=1, le=30)
    syllabus_json: Optional[Dict[str, Any]] = None


class CourseTemplateResponse(CourseTemplateBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
