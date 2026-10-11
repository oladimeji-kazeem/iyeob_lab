from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from app.schemas.course_offering import CourseOfferingCreate, CourseOfferingResponse, CourseOfferingUpdate
from app.services.store import DatabaseRepository, get_repository

router = APIRouter()


@router.get(
    "",
    response_model=List[CourseOfferingResponse],
    summary="List Institution Semester Course Offerings",
)
def list_offerings(
    institution_id: Optional[UUID] = Query(None, description="Filter by institution UUID"),
    semester: Optional[str] = Query(None, description="Filter by semester term, e.g. Fall 2026"),
    repo: DatabaseRepository = Depends(get_repository),
) -> List[CourseOfferingResponse]:
    """List scheduled course offerings with per-semester pricing, capacity, and lecturer."""
    return repo.list_offerings(institution_id=institution_id, semester=semester)


@router.post(
    "",
    response_model=CourseOfferingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Schedule New Course Offering",
)
def create_offering(
    data: CourseOfferingCreate,
    repo: DatabaseRepository = Depends(get_repository),
) -> CourseOfferingResponse:
    """Schedules a course template for an institution's semester with specific pricing and seat capacity."""
    return repo.create_offering(data)


@router.get(
    "/{offering_id}",
    response_model=CourseOfferingResponse,
    summary="Get Course Offering Details",
)
def get_offering(
    offering_id: UUID,
    repo: DatabaseRepository = Depends(get_repository),
) -> CourseOfferingResponse:
    """Retrieve course offering details by UUID."""
    return repo.get_offering(offering_id)


@router.put(
    "/{offering_id}",
    response_model=CourseOfferingResponse,
    summary="Update Course Offering",
)
def update_offering(
    offering_id: UUID,
    data: CourseOfferingUpdate,
    repo: DatabaseRepository = Depends(get_repository),
) -> CourseOfferingResponse:
    """Update course offering capacity, pricing, status, or assigned lecturer."""
    return repo.update_offering(offering_id, data)
