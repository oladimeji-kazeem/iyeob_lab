from fastapi import APIRouter, Depends, status
from app.schemas.auth import SignInRequest, SignOutResponse, SignUpRequest, TokenResponse
from app.schemas.user import UserResponse
from app.services.store import DatabaseRepository, get_repository

router = APIRouter()


@router.post(
    "/signup",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="User Registration & Institution Membership Provisioning",
)
def signup(
    req: SignUpRequest,
    repo: DatabaseRepository = Depends(get_repository),
) -> TokenResponse:
    """Registers a new user through Supabase Auth, storing their identity and optional institutional membership."""
    return repo.sign_up(req)


@router.post(
    "/signin",
    response_model=TokenResponse,
    summary="Authenticate User with Supabase",
)
def signin(
    req: SignInRequest,
    repo: DatabaseRepository = Depends(get_repository),
) -> TokenResponse:
    """Authenticates the user using email and password against Supabase Auth."""
    return repo.sign_in(req)


@router.post(
    "/signout",
    response_model=SignOutResponse,
    summary="Sign Out Current Session",
)
def signout() -> SignOutResponse:
    """Terminates the active authentication session."""
    return SignOutResponse(message="Successfully signed out from Supabase session")
