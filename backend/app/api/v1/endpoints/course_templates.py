from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status
from app.schemas.course_template import CourseTemplateCreate, CourseTemplateResponse, CourseTemplateUpdate
from app.services.store import DatabaseRepository, get_repository

router = APIRouter()


@router.get(
    "",
    response_model=List[CourseTemplateResponse],
    summary="List Master Course Templates",
)
def list_templates(
    repo: DatabaseRepository = Depends(get_repository),
) -> List[CourseTemplateResponse]:
    """Retrieve all reusable master course templates in the curriculum catalog."""
    return repo.list_templates()


@router.post(
    "",
    response_model=CourseTemplateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Course Template",
)
def create_template(
    data: CourseTemplateCreate,
    repo: DatabaseRepository = Depends(get_repository),
) -> CourseTemplateResponse:
    """Creates a reusable curriculum master template (independent of institutions and semesters)."""
    return repo.create_template(data)


@router.get(
    "/{template_id}",
    response_model=CourseTemplateResponse,
    summary="Get Course Template Details",
)
def get_template(
    template_id: UUID,
    repo: DatabaseRepository = Depends(get_repository),
) -> CourseTemplateResponse:
    """Retrieve master course template by UUID."""
    return repo.get_template(template_id)


@router.put(
    "/{template_id}",
    response_model=CourseTemplateResponse,
    summary="Update Course Template",
)
def update_template(
    template_id: UUID,
    data: CourseTemplateUpdate,
    repo: DatabaseRepository = Depends(get_repository),
) -> CourseTemplateResponse:
    """Update course template title, credits, or syllabus."""
    return repo.update_template(template_id, data)
