from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class MembershipRole(str, Enum):
    STUDENT = "student"
    LECTURER = "lecturer"
    ADMIN = "admin"


class MembershipStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    INVITED = "invited"


class MembershipBase(BaseModel):
    role: MembershipRole = Field(MembershipRole.STUDENT, description="Assigned role in institution")
    status: MembershipStatus = Field(MembershipStatus.ACTIVE, description="Membership status")


class MembershipCreate(MembershipBase):
    user_id: UUID = Field(..., description="Foreign key reference to public.users(id)")
    institution_id: UUID = Field(..., description="Foreign key reference to public.institutions(id)")


class MembershipUpdate(BaseModel):
    role: Optional[MembershipRole] = None
    status: Optional[MembershipStatus] = None


class MembershipResponse(MembershipBase):
    id: UUID
    user_id: UUID
    institution_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
