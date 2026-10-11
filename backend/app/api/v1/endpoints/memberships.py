from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from app.schemas.membership import MembershipCreate, MembershipResponse, MembershipUpdate
from app.services.store import DatabaseRepository, get_repository

router = APIRouter()


@router.get(
    "",
    response_model=List[MembershipResponse],
    summary="List Memberships",
)
def list_memberships(
    institution_id: Optional[UUID] = Query(None, description="Filter by institution UUID"),
    user_id: Optional[UUID] = Query(None, description="Filter by user UUID"),
    repo: DatabaseRepository = Depends(get_repository),
) -> List[MembershipResponse]:
    """List institutional memberships, filterable by institution or user."""
    return repo.list_memberships(institution_id=institution_id, user_id=user_id)


@router.post(
    "",
    response_model=MembershipResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Assign User to Institution",
)
def create_membership(
    data: MembershipCreate,
    repo: DatabaseRepository = Depends(get_repository),
) -> MembershipResponse:
    """Assigns an institutional role (student, lecturer, admin) to a user."""
    return repo.create_membership(data)


@router.get(
    "/{membership_id}",
    response_model=MembershipResponse,
    summary="Get Membership Details",
)
def get_membership(
    membership_id: UUID,
    repo: DatabaseRepository = Depends(get_repository),
) -> MembershipResponse:
    """Retrieve membership by UUID."""
    return repo.get_membership(membership_id)


@router.put(
    "/{membership_id}",
    response_model=MembershipResponse,
    summary="Update Membership Role or Status",
)
def update_membership(
    membership_id: UUID,
    data: MembershipUpdate,
    repo: DatabaseRepository = Depends(get_repository),
) -> MembershipResponse:
    """Update role or status of an existing membership."""
    return repo.update_membership(membership_id, data)


@router.delete(
    "/{membership_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove Institutional Membership",
)
def delete_membership(
    membership_id: UUID,
    repo: DatabaseRepository = Depends(get_repository),
):
    """Revoke a user's membership within an institution."""
    repo.delete_membership(membership_id)
    return None
