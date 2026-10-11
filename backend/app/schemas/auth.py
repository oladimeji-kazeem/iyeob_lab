from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field
from app.schemas.membership import MembershipRole
from app.schemas.user import UserResponse


class SignUpRequest(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="Password (at least 6 characters)")
    full_name: str = Field(..., min_length=1, max_length=255, description="Full name")
    institution_id: Optional[UUID] = Field(None, description="Optional default institution")
    role: Optional[MembershipRole] = Field(MembershipRole.STUDENT, description="Initial institutional role")


class SignInRequest(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=1, description="Password")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: Optional[int] = None
    user: UserResponse


class SignOutResponse(BaseModel):
    message: str = "Successfully logged out"


class AuthSession(BaseModel):
    user: UserResponse
    access_token: str
    token_type: str = "bearer"

