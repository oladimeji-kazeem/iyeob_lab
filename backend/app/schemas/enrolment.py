from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class EnrolmentStatus(str, Enum):
    PENDING = "pending"
    ENROLLED = "enrolled"
    COMPLETED = "completed"
    DROPPED = "dropped"


class PaymentStatus(str, Enum):
    UNPAID = "unpaid"
    PAID = "paid"
    REFUNDED = "refunded"
    WAIVED = "waived"


class EnrolmentBase(BaseModel):
    status: EnrolmentStatus = Field(EnrolmentStatus.ENROLLED, description="Academic enrollment lifecycle status")
    payment_status: PaymentStatus = Field(PaymentStatus.UNPAID, description="Tuition payment status")
    grade: Optional[float] = Field(None, ge=0.0, le=100.0, description="Final grade percentage (0-100)")


class EnrolmentCreate(EnrolmentBase):
    offering_id: UUID = Field(..., description="Foreign key reference to course_offerings(id)")
    student_id: UUID = Field(..., description="Foreign key reference to public.users(id)")


class EnrolmentUpdate(BaseModel):
    status: Optional[EnrolmentStatus] = None
    payment_status: Optional[PaymentStatus] = None
    grade: Optional[float] = Field(None, ge=0.0, le=100.0)


class EnrolmentResponse(EnrolmentBase):
    id: UUID
    offering_id: UUID
    student_id: UUID
    enrolled_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
