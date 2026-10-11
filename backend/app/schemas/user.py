from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr = Field(..., description="Unique email address")
    full_name: str = Field(..., min_length=1, max_length=255, description="User full display name")
    avatar_url: Optional[str] = Field(None, description="Profile avatar URL")


class UserCreate(UserBase):
    id: Optional[UUID] = Field(None, description="Supabase auth UUID if pre-generated")
    password: Optional[str] = Field(None, min_length=6, description="Initial auth password")


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    avatar_url: Optional[str] = None


class UserResponse(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
