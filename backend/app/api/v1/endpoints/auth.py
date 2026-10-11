from typing import Optional
from fastapi import APIRouter, Depends, status
from app.api.deps import get_current_token, get_current_user
from app.schemas.auth import (
    PasswordRecoveryRequest,
    PasswordRecoveryResponse,
    PasswordResetRequest,
    PasswordResetResponse,
    SessionPrincipal,
    SignInRequest,
    SignOutResponse,
    SignUpRequest,
    TokenResponse,
)
from app.services.store import DatabaseRepository, get_repository

router = APIRouter()


@router.post(
    "/signup",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="User Registration & Password Hashing",
)
def signup(
    req: SignUpRequest,
    repo: DatabaseRepository = Depends(get_repository),
) -> TokenResponse:
    """Registers a new user, hashes password with bcrypt, and initializes session token."""
    return repo.sign_up(req)


@router.post(
    "/signin",
    response_model=TokenResponse,
    summary="Authenticate User & Issue Session Token",
)
def signin(
    req: SignInRequest,
    repo: DatabaseRepository = Depends(get_repository),
) -> TokenResponse:
    """Authenticates the user using email and password, returning a signed JWT access token."""
    return repo.sign_in(req)


@router.post(
    "/signout",
    response_model=SignOutResponse,
    summary="Sign Out & Revoke Session Token",
)
def signout(
    token: Optional[str] = Depends(get_current_token),
    repo: DatabaseRepository = Depends(get_repository),
) -> SignOutResponse:
    """Terminates the active session and adds the token to the revocation blacklist."""
    return repo.sign_out(token=token)


@router.get(
    "/me",
    response_model=SessionPrincipal,
    summary="Get Authenticated Session Principal",
)
def get_me(
    principal: SessionPrincipal = Depends(get_current_user),
) -> SessionPrincipal:
    """Derives current verified principal and institutional memberships from session token."""
    return principal


@router.post(
    "/forgot-password",
    response_model=PasswordRecoveryResponse,
    summary="Request Password Recovery",
)
def forgot_password(
    req: PasswordRecoveryRequest,
    repo: DatabaseRepository = Depends(get_repository),
) -> PasswordRecoveryResponse:
    """Initiates password recovery by issuing a cryptographic, short-lived reset token."""
    return repo.request_password_recovery(req)


@router.post(
    "/reset-password",
    response_model=PasswordResetResponse,
    summary="Confirm Password Reset",
)
def reset_password(
    req: PasswordResetRequest,
    repo: DatabaseRepository = Depends(get_repository),
) -> PasswordResetResponse:
    """Validates the reset token and updates the user's password with new bcrypt hash."""
    return repo.reset_password(req)
