from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.services.store import DatabaseRepository, get_repository

router = APIRouter()


@router.get(
    "",
    response_model=List[UserResponse],
    summary="List All Academic Users",
)
def list_users(
    repo: DatabaseRepository = Depends(get_repository),
) -> List[UserResponse]:
    """Retrieve all users across institutions."""
    return repo.list_users()


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create User Profile",
)
def create_user(
    data: UserCreate,
    repo: DatabaseRepository = Depends(get_repository),
) -> UserResponse:
    """Manually provision a user profile."""
    return repo.create_user(data)


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Get User Profile",
)
def get_user(
    user_id: UUID,
    repo: DatabaseRepository = Depends(get_repository),
) -> UserResponse:
    """Retrieve user profile by UUID."""
    return repo.get_user(user_id)


@router.put(
    "/{user_id}",
    response_model=UserResponse,
    summary="Update User Profile",
)
def update_user(
    user_id: UUID,
    data: UserUpdate,
    repo: DatabaseRepository = Depends(get_repository),
) -> UserResponse:
    """Update user information and updated_at timestamp."""
    return repo.update_user(user_id, data)
