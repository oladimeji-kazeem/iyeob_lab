from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field
from app.schemas.membership import MembershipResponse, MembershipRole
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


class PasswordRecoveryRequest(BaseModel):
    email: EmailStr = Field(..., description="Registered user email address for password recovery")


class PasswordRecoveryResponse(BaseModel):
    message: str = "If an account with that email exists, password recovery instructions have been dispatched."
    reset_token: Optional[str] = Field(
        None,
        description="Password recovery token provided for demonstration and immediate confirmation",
    )


class PasswordResetRequest(BaseModel):
    token: str = Field(..., min_length=10, description="Cryptographic password reset token")
    new_password: str = Field(..., min_length=6, description="New password (minimum 6 characters)")


class PasswordResetResponse(BaseModel):
    message: str = "Password has been successfully reset. You may now log in with your new credentials."


class SessionPrincipal(BaseModel):
    """Derived authenticated principal from verified session tokens."""
    user: UserResponse
    memberships: List[MembershipResponse] = []
