from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    course_offerings,
    course_templates,
    enrolments,
    health,
    institutions,
    memberships,
    users,
)

api_router = APIRouter()

# Register core health probe
api_router.include_router(health.router, tags=["Health"])

# Register Supabase authentication & identity routes
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])

# Register Academic Multi-Tenant Modules
api_router.include_router(institutions.router, prefix="/institutions", tags=["Institutions"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(memberships.router, prefix="/memberships", tags=["Memberships"])
api_router.include_router(course_templates.router, prefix="/course-templates", tags=["Course Templates"])
api_router.include_router(course_offerings.router, prefix="/course-offerings", tags=["Course Offerings"])
api_router.include_router(enrolments.router, prefix="/enrolments", tags=["Enrolments"])
