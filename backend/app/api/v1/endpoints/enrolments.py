from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from app.schemas.enrolment import EnrolmentCreate, EnrolmentResponse, EnrolmentUpdate
from app.services.store import DatabaseRepository, get_repository

router = APIRouter()


@router.get(
    "",
    response_model=List[EnrolmentResponse],
    summary="List Student Enrolments",
)
def list_enrolments(
    student_id: Optional[UUID] = Query(None, description="Filter by student user UUID"),
    offering_id: Optional[UUID] = Query(None, description="Filter by course offering UUID"),
    repo: DatabaseRepository = Depends(get_repository),
) -> List[EnrolmentResponse]:
    """List academic course enrolments with statuses and grades."""
    return repo.list_enrolments(student_id=student_id, offering_id=offering_id)


@router.post(
    "",
    response_model=EnrolmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Enrol Student in Offering",
)
def create_enrolment(
    data: EnrolmentCreate,
    repo: DatabaseRepository = Depends(get_repository),
) -> EnrolmentResponse:
    """Enrol a student into an open course offering with uniqueness validation."""
    return repo.create_enrolment(data)


@router.get(
    "/{enrolment_id}",
    response_model=EnrolmentResponse,
    summary="Get Enrolment Record",
)
def get_enrolment(
    enrolment_id: UUID,
    repo: DatabaseRepository = Depends(get_repository),
) -> EnrolmentResponse:
    """Retrieve enrolment record by UUID."""
    return repo.get_enrolment(enrolment_id)


@router.put(
    "/{enrolment_id}",
    response_model=EnrolmentResponse,
    summary="Update Enrolment, Payment or Grade",
)
def update_enrolment(
    enrolment_id: UUID,
    data: EnrolmentUpdate,
    repo: DatabaseRepository = Depends(get_repository),
) -> EnrolmentResponse:
    """Update enrolment status, tuition payment status, or submitted grade."""
    return repo.update_enrolment(enrolment_id, data)
