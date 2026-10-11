from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from app.schemas.institution import InstitutionCreate, InstitutionResponse, InstitutionUpdate
from app.services.store import DatabaseRepository, get_repository

router = APIRouter()


@router.get(
    "",
    response_model=List[InstitutionResponse],
    summary="List All Institutions",
)
def list_institutions(
    active_only: Optional[bool] = Query(None, description="Filter by active status"),
    repo: DatabaseRepository = Depends(get_repository),
) -> List[InstitutionResponse]:
    """Retrieve all academic institutions with optional active state filtering."""
    return repo.list_institutions(active_only=active_only)


@router.post(
    "",
    response_model=InstitutionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create New Institution",
)
def create_institution(
    data: InstitutionCreate,
    repo: DatabaseRepository = Depends(get_repository),
) -> InstitutionResponse:
    """Create a new academic institution with unique code and domain constraints."""
    return repo.create_institution(data)


@router.get(
    "/{institution_id}",
    response_model=InstitutionResponse,
    summary="Get Institution Details",
)
def get_institution(
    institution_id: UUID,
    repo: DatabaseRepository = Depends(get_repository),
) -> InstitutionResponse:
    """Get single institution details by its UUID."""
    return repo.get_institution(institution_id)


@router.put(
    "/{institution_id}",
    response_model=InstitutionResponse,
    summary="Update Institution",
)
def update_institution(
    institution_id: UUID,
    data: InstitutionUpdate,
    repo: DatabaseRepository = Depends(get_repository),
) -> InstitutionResponse:
    """Update institution details and timestamps."""
    return repo.update_institution(institution_id, data)
