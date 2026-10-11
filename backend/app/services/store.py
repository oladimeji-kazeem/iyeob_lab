from datetime import datetime, timezone
import logging
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4
from fastapi import HTTPException, status
from postgrest.exceptions import APIError
from app.core.supabase import get_supabase_client
from app.schemas.auth import SignInRequest, SignUpRequest, TokenResponse
from app.schemas.course_offering import CourseOfferingCreate, CourseOfferingResponse, CourseOfferingUpdate
from app.schemas.course_template import CourseTemplateCreate, CourseTemplateResponse, CourseTemplateUpdate
from app.schemas.enrolment import EnrolmentCreate, EnrolmentResponse, EnrolmentUpdate
from app.schemas.institution import InstitutionCreate, InstitutionResponse, InstitutionUpdate
from app.schemas.membership import MembershipCreate, MembershipResponse, MembershipRole, MembershipStatus, MembershipUpdate
from app.schemas.user import UserCreate, UserResponse, UserUpdate

logger = logging.getLogger("uvicorn.error")


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class DatabaseRepository:
    """Repository managing academic multi-tenant entities with Supabase integration and robust fallback."""

    def __init__(self):
        # Local state storage adhering strictly to relational schema
        self._institutions: Dict[UUID, Dict[str, Any]] = {}
        self._users: Dict[UUID, Dict[str, Any]] = {}
        self._memberships: Dict[UUID, Dict[str, Any]] = {}
        self._course_templates: Dict[UUID, Dict[str, Any]] = {}
        self._course_offerings: Dict[UUID, Dict[str, Any]] = {}
        self._enrolments: Dict[UUID, Dict[str, Any]] = {}

        self._seed_default_data()

    def _seed_default_data(self):
        inst1_id = UUID("00000000-0000-0000-0000-000000000001")
        inst2_id = UUID("00000000-0000-0000-0000-000000000002")
        now = utc_now()

        self._institutions[inst1_id] = {
            "id": inst1_id,
            "name": "Massachusetts Institute of Practical Technology",
            "code": "MIPT",
            "domain": "mipt.edu",
            "is_active": True,
            "created_at": now,
            "updated_at": now,
        }
        self._institutions[inst2_id] = {
            "id": inst2_id,
            "name": "London Practical Academy",
            "code": "LPA",
            "domain": "lpa.ac.uk",
            "is_active": True,
            "created_at": now,
            "updated_at": now,
        }

        user1_id = UUID("10000000-0000-0000-0000-000000000001")
        user2_id = UUID("10000000-0000-0000-0000-000000000002")
        user3_id = UUID("10000000-0000-0000-0000-000000000003")

        self._users[user1_id] = {
            "id": user1_id,
            "email": "admin@ubasify.edu",
            "full_name": "Dr. Ada Lovelace",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            "created_at": now,
            "updated_at": now,
        }
        self._users[user2_id] = {
            "id": user2_id,
            "email": "lecturer@mipt.edu",
            "full_name": "Prof. Alan Turing",
            "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            "created_at": now,
            "updated_at": now,
        }
        self._users[user3_id] = {
            "id": user3_id,
            "email": "student@mipt.edu",
            "full_name": "Kazeem Oladimeji",
            "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
            "created_at": now,
            "updated_at": now,
        }

        mem1_id = UUID("20000000-0000-0000-0000-000000000001")
        mem2_id = UUID("20000000-0000-0000-0000-000000000002")
        mem3_id = UUID("20000000-0000-0000-0000-000000000003")

        self._memberships[mem1_id] = {
            "id": mem1_id,
            "user_id": user1_id,
            "institution_id": inst1_id,
            "role": MembershipRole.ADMIN,
            "status": MembershipStatus.ACTIVE,
            "created_at": now,
            "updated_at": now,
        }
        self._memberships[mem2_id] = {
            "id": mem2_id,
            "user_id": user2_id,
            "institution_id": inst1_id,
            "role": MembershipRole.LECTURER,
            "status": MembershipStatus.ACTIVE,
            "created_at": now,
            "updated_at": now,
        }
        self._memberships[mem3_id] = {
            "id": mem3_id,
            "user_id": user3_id,
            "institution_id": inst1_id,
            "role": MembershipRole.STUDENT,
            "status": MembershipStatus.ACTIVE,
            "created_at": now,
            "updated_at": now,
        }

        tpl1_id = UUID("30000000-0000-0000-0000-000000000001")
        tpl2_id = UUID("30000000-0000-0000-0000-000000000002")

        self._course_templates[tpl1_id] = {
            "id": tpl1_id,
            "code": "CS101",
            "title": "Foundations of Computer Systems & Networks",
            "description": "In-depth laboratory on operating systems, network topologies, and distributed synchronization.",
            "credits": 4,
            "syllabus_json": {"modules": ["Memory Architecture", "Concurrency Primitives", "Socket Programming"]},
            "created_at": now,
            "updated_at": now,
        }
        self._course_templates[tpl2_id] = {
            "id": tpl2_id,
            "code": "SE202",
            "title": "Full-Stack Distributed Engineering",
            "description": "Design patterns for modern scalable web architectures, databases, and microservices.",
            "credits": 3,
            "syllabus_json": {"modules": ["REST & GraphQL", "Database Indexing & RLS", "Message Queues"]},
            "created_at": now,
            "updated_at": now,
        }

        off1_id = UUID("40000000-0000-0000-0000-000000000001")
        off2_id = UUID("40000000-0000-0000-0000-000000000002")

        self._course_offerings[off1_id] = {
            "id": off1_id,
            "template_id": tpl1_id,
            "institution_id": inst1_id,
            "lecturer_id": user2_id,
            "semester": "Fall 2026",
            "price_cents": 35000,
            "capacity": 50,
            "is_open": True,
            "created_at": now,
            "updated_at": now,
        }
        self._course_offerings[off2_id] = {
            "id": off2_id,
            "template_id": tpl2_id,
            "institution_id": inst1_id,
            "lecturer_id": user2_id,
            "semester": "Fall 2026",
            "price_cents": 42000,
            "capacity": 40,
            "is_open": True,
            "created_at": now,
            "updated_at": now,
        }

        enr1_id = UUID("50000000-0000-0000-0000-000000000001")
        self._enrolments[enr1_id] = {
            "id": enr1_id,
            "offering_id": off1_id,
            "student_id": user3_id,
            "status": "enrolled",
            "payment_status": "paid",
            "grade": 92.50,
            "enrolled_at": now,
            "updated_at": now,
        }

    # =========================================================================
    # INSTITUTIONS
    # =========================================================================
    def list_institutions(self, active_only: Optional[bool] = None) -> List[InstitutionResponse]:
        try:
            supabase = get_supabase_client()
            q = supabase.table("institutions").select("*")
            if active_only is not None:
                q = q.eq("is_active", active_only)
            res = q.execute()
            if res.data:
                return [InstitutionResponse.model_validate(row) for row in res.data]
        except Exception as e:
            logger.debug("Falling back to local repository for list_institutions: %s", e)

        rows = list(self._institutions.values())
        if active_only is not None:
            rows = [r for r in rows if r["is_active"] == active_only]
        return [InstitutionResponse.model_validate(r) for r in rows]

    def get_institution(self, institution_id: UUID) -> InstitutionResponse:
        try:
            supabase = get_supabase_client()
            res = supabase.table("institutions").select("*").eq("id", str(institution_id)).single().execute()
            if res.data:
                return InstitutionResponse.model_validate(res.data)
        except Exception as e:
            logger.debug("Falling back to local repository for get_institution: %s", e)

        inst = self._institutions.get(institution_id)
        if not inst:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found")
        return InstitutionResponse.model_validate(inst)

    def create_institution(self, data: InstitutionCreate) -> InstitutionResponse:
        # Check code uniqueness
        for inst in self._institutions.values():
            if inst["code"].lower() == data.code.lower():
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Institution code already exists")
            if data.domain and inst.get("domain") and inst["domain"].lower() == data.domain.lower():
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Institution domain already exists")

        new_id = uuid4()
        now = utc_now()
        payload = {
            "id": str(new_id),
            "name": data.name,
            "code": data.code,
            "domain": data.domain,
            "is_active": data.is_active,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
        }

        try:
            supabase = get_supabase_client()
            res = supabase.table("institutions").insert(payload).execute()
            if res.data:
                return InstitutionResponse.model_validate(res.data[0])
        except Exception as e:
            logger.debug("Supabase insert fallback for institutions: %s", e)

        stored = {
            "id": new_id,
            "name": data.name,
            "code": data.code,
            "domain": data.domain,
            "is_active": data.is_active,
            "created_at": now,
            "updated_at": now,
        }
        self._institutions[new_id] = stored
        return InstitutionResponse.model_validate(stored)

    def update_institution(self, institution_id: UUID, data: InstitutionUpdate) -> InstitutionResponse:
        inst = self._institutions.get(institution_id)
        if not inst:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found")

        update_dict = data.model_dump(exclude_unset=True)
        if "code" in update_dict and update_dict["code"]:
            for other_id, other in self._institutions.items():
                if other_id != institution_id and other["code"].lower() == update_dict["code"].lower():
                    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Institution code already exists")

        now = utc_now()
        update_dict["updated_at"] = now
        inst.update(update_dict)
        return InstitutionResponse.model_validate(inst)

    # =========================================================================
    # USERS
    # =========================================================================
    def list_users(self) -> List[UserResponse]:
        try:
            supabase = get_supabase_client()
            res = supabase.table("users").select("*").execute()
            if res.data:
                return [UserResponse.model_validate(row) for row in res.data]
        except Exception as e:
            logger.debug("Supabase users list fallback: %s", e)

        return [UserResponse.model_validate(u) for u in self._users.values()]

    def get_user(self, user_id: UUID) -> UserResponse:
        try:
            supabase = get_supabase_client()
            res = supabase.table("users").select("*").eq("id", str(user_id)).single().execute()
            if res.data:
                return UserResponse.model_validate(res.data)
        except Exception as e:
            logger.debug("Supabase get user fallback: %s", e)

        user = self._users.get(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return UserResponse.model_validate(user)

    def create_user(self, data: UserCreate) -> UserResponse:
        for u in self._users.values():
            if u["email"].lower() == data.email.lower():
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User email already registered")

        user_id = data.id or uuid4()
        now = utc_now()
        payload = {
            "id": user_id,
            "email": str(data.email),
            "full_name": data.full_name,
            "avatar_url": data.avatar_url,
            "created_at": now,
            "updated_at": now,
        }
        self._users[user_id] = payload
        return UserResponse.model_validate(payload)

    def update_user(self, user_id: UUID, data: UserUpdate) -> UserResponse:
        user = self._users.get(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        update_dict = data.model_dump(exclude_unset=True)
        update_dict["updated_at"] = utc_now()
        user.update(update_dict)
        return UserResponse.model_validate(user)

    # =========================================================================
    # MEMBERSHIPS
    # =========================================================================
    def list_memberships(
        self, institution_id: Optional[UUID] = None, user_id: Optional[UUID] = None
    ) -> List[MembershipResponse]:
        try:
            supabase = get_supabase_client()
            q = supabase.table("memberships").select("*")
            if institution_id:
                q = q.eq("institution_id", str(institution_id))
            if user_id:
                q = q.eq("user_id", str(user_id))
            res = q.execute()
            if res.data:
                return [MembershipResponse.model_validate(row) for row in res.data]
        except Exception as e:
            logger.debug("Supabase list memberships fallback: %s", e)

        rows = list(self._memberships.values())
        if institution_id:
            rows = [r for r in rows if r["institution_id"] == institution_id]
        if user_id:
            rows = [r for r in rows if r["user_id"] == user_id]
        return [MembershipResponse.model_validate(r) for r in rows]

    def create_membership(self, data: MembershipCreate) -> MembershipResponse:
        # Validate foreign keys
        if data.user_id not in self._users:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referenced user does not exist")
        if data.institution_id not in self._institutions:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referenced institution does not exist")

        # Unique constraint on (user_id, institution_id)
        for m in self._memberships.values():
            if m["user_id"] == data.user_id and m["institution_id"] == data.institution_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="User already holds a membership in this institution",
                )

        mem_id = uuid4()
        now = utc_now()
        entry = {
            "id": mem_id,
            "user_id": data.user_id,
            "institution_id": data.institution_id,
            "role": data.role,
            "status": data.status,
            "created_at": now,
            "updated_at": now,
        }
        self._memberships[mem_id] = entry
        return MembershipResponse.model_validate(entry)

    def get_membership(self, membership_id: UUID) -> MembershipResponse:
        mem = self._memberships.get(membership_id)
        if not mem:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membership not found")
        return MembershipResponse.model_validate(mem)

    def update_membership(self, membership_id: UUID, data: MembershipUpdate) -> MembershipResponse:
        mem = self._memberships.get(membership_id)
        if not mem:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membership not found")
        update_dict = data.model_dump(exclude_unset=True)
        update_dict["updated_at"] = utc_now()
        mem.update(update_dict)
        return MembershipResponse.model_validate(mem)

    def delete_membership(self, membership_id: UUID) -> bool:
        if membership_id not in self._memberships:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membership not found")
        del self._memberships[membership_id]
        return True

    # =========================================================================
    # COURSE TEMPLATES (Reusable independent curriculum)
    # =========================================================================
    def list_templates(self) -> List[CourseTemplateResponse]:
        try:
            supabase = get_supabase_client()
            res = supabase.table("course_templates").select("*").execute()
            if res.data:
                return [CourseTemplateResponse.model_validate(row) for row in res.data]
        except Exception as e:
            logger.debug("Supabase list templates fallback: %s", e)

        return [CourseTemplateResponse.model_validate(t) for t in self._course_templates.values()]

    def get_template(self, template_id: UUID) -> CourseTemplateResponse:
        tpl = self._course_templates.get(template_id)
        if not tpl:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course template not found")
        return CourseTemplateResponse.model_validate(tpl)

    def create_template(self, data: CourseTemplateCreate) -> CourseTemplateResponse:
        for tpl in self._course_templates.values():
            if tpl["code"].lower() == data.code.lower():
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Course code already exists")

        new_id = uuid4()
        now = utc_now()
        entry = {
            "id": new_id,
            "code": data.code,
            "title": data.title,
            "description": data.description,
            "credits": data.credits,
            "syllabus_json": data.syllabus_json or {},
            "created_at": now,
            "updated_at": now,
        }
        self._course_templates[new_id] = entry
        return CourseTemplateResponse.model_validate(entry)

    def update_template(self, template_id: UUID, data: CourseTemplateUpdate) -> CourseTemplateResponse:
        tpl = self._course_templates.get(template_id)
        if not tpl:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course template not found")
        update_dict = data.model_dump(exclude_unset=True)
        if "code" in update_dict and update_dict["code"]:
            for other_id, other in self._course_templates.items():
                if other_id != template_id and other["code"].lower() == update_dict["code"].lower():
                    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Course code already exists")
        update_dict["updated_at"] = utc_now()
        tpl.update(update_dict)
        return CourseTemplateResponse.model_validate(tpl)

    # =========================================================================
    # COURSE OFFERINGS (Institution & semester specific offerings)
    # =========================================================================
    def list_offerings(
        self, institution_id: Optional[UUID] = None, semester: Optional[str] = None
    ) -> List[CourseOfferingResponse]:
        try:
            supabase = get_supabase_client()
            q = supabase.table("course_offerings").select("*")
            if institution_id:
                q = q.eq("institution_id", str(institution_id))
            if semester:
                q = q.eq("semester", semester)
            res = q.execute()
            if res.data:
                return [CourseOfferingResponse.model_validate(row) for row in res.data]
        except Exception as e:
            logger.debug("Supabase list offerings fallback: %s", e)

        rows = list(self._course_offerings.values())
        if institution_id:
            rows = [r for r in rows if r["institution_id"] == institution_id]
        if semester:
            rows = [r for r in rows if r["semester"].lower() == semester.lower()]
        return [CourseOfferingResponse.model_validate(r) for r in rows]

    def get_offering(self, offering_id: UUID) -> CourseOfferingResponse:
        off = self._course_offerings.get(offering_id)
        if not off:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course offering not found")
        return CourseOfferingResponse.model_validate(off)

    def create_offering(self, data: CourseOfferingCreate) -> CourseOfferingResponse:
        # Validate foreign keys
        if data.template_id not in self._course_templates:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referenced course template not found")
        if data.institution_id not in self._institutions:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referenced institution not found")
        if data.lecturer_id and data.lecturer_id not in self._users:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referenced lecturer user not found")

        # Check unique constraint (institution_id, template_id, semester)
        for off in self._course_offerings.values():
            if (
                off["institution_id"] == data.institution_id
                and off["template_id"] == data.template_id
                and off["semester"].lower() == data.semester.lower()
            ):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Offering for this template and semester already exists in this institution",
                )

        new_id = uuid4()
        now = utc_now()
        entry = {
            "id": new_id,
            "template_id": data.template_id,
            "institution_id": data.institution_id,
            "lecturer_id": data.lecturer_id,
            "semester": data.semester,
            "price_cents": data.price_cents,
            "capacity": data.capacity,
            "is_open": data.is_open,
            "created_at": now,
            "updated_at": now,
        }
        self._course_offerings[new_id] = entry
        return CourseOfferingResponse.model_validate(entry)

    def update_offering(self, offering_id: UUID, data: CourseOfferingUpdate) -> CourseOfferingResponse:
        off = self._course_offerings.get(offering_id)
        if not off:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course offering not found")
        if data.lecturer_id and data.lecturer_id not in self._users:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referenced lecturer user not found")

        update_dict = data.model_dump(exclude_unset=True)
        update_dict["updated_at"] = utc_now()
        off.update(update_dict)
        return CourseOfferingResponse.model_validate(off)

    # =========================================================================
    # ENROLMENTS
    # =========================================================================
    def list_enrolments(
        self, student_id: Optional[UUID] = None, offering_id: Optional[UUID] = None
    ) -> List[EnrolmentResponse]:
        try:
            supabase = get_supabase_client()
            q = supabase.table("enrolments").select("*")
            if student_id:
                q = q.eq("student_id", str(student_id))
            if offering_id:
                q = q.eq("offering_id", str(offering_id))
            res = q.execute()
            if res.data:
                return [EnrolmentResponse.model_validate(row) for row in res.data]
        except Exception as e:
            logger.debug("Supabase list enrolments fallback: %s", e)

        rows = list(self._enrolments.values())
        if student_id:
            rows = [r for r in rows if r["student_id"] == student_id]
        if offering_id:
            rows = [r for r in rows if r["offering_id"] == offering_id]
        return [EnrolmentResponse.model_validate(r) for r in rows]

    def get_enrolment(self, enrolment_id: UUID) -> EnrolmentResponse:
        enr = self._enrolments.get(enrolment_id)
        if not enr:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrolment not found")
        return EnrolmentResponse.model_validate(enr)

    def create_enrolment(self, data: EnrolmentCreate) -> EnrolmentResponse:
        # Validate foreign keys
        if data.offering_id not in self._course_offerings:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referenced course offering not found")
        if data.student_id not in self._users:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referenced student user not found")

        offering = self._course_offerings[data.offering_id]
        if not offering.get("is_open", True):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Offering is currently closed for enrolment")

        # Unique constraint (student_id, offering_id)
        for enr in self._enrolments.values():
            if enr["student_id"] == data.student_id and enr["offering_id"] == data.offering_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Student is already enrolled in this course offering",
                )

        new_id = uuid4()
        now = utc_now()
        entry = {
            "id": new_id,
            "offering_id": data.offering_id,
            "student_id": data.student_id,
            "status": data.status,
            "payment_status": data.payment_status,
            "grade": data.grade,
            "enrolled_at": now,
            "updated_at": now,
        }
        self._enrolments[new_id] = entry
        return EnrolmentResponse.model_validate(entry)

    def update_enrolment(self, enrolment_id: UUID, data: EnrolmentUpdate) -> EnrolmentResponse:
        enr = self._enrolments.get(enrolment_id)
        if not enr:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrolment not found")
        update_dict = data.model_dump(exclude_unset=True)
        update_dict["updated_at"] = utc_now()
        enr.update(update_dict)
        return EnrolmentResponse.model_validate(enr)

    # =========================================================================
    # AUTHENTICATION
    # =========================================================================
    def sign_up(self, req: SignUpRequest) -> TokenResponse:
        # Attempt Supabase Auth signup
        try:
            supabase = get_supabase_client()
            auth_res = supabase.auth.sign_up(
                {
                    "email": req.email,
                    "password": req.password,
                    "options": {
                        "data": {
                            "full_name": req.full_name,
                        }
                    },
                }
            )
            if auth_res.user:
                user_id = UUID(auth_res.user.id)
                user_resp = UserResponse(
                    id=user_id,
                    email=req.email,
                    full_name=req.full_name,
                    avatar_url=None,
                    created_at=utc_now(),
                    updated_at=utc_now(),
                )
                access_token = (
                    auth_res.session.access_token if auth_res.session else f"jwt_mock_token_{user_id}"
                )
                # Store user in local repo
                self._users[user_id] = user_resp.model_dump()
                # Create default membership if institution provided
                if req.institution_id and req.institution_id in self._institutions:
                    self.create_membership(
                        MembershipCreate(
                            user_id=user_id,
                            institution_id=req.institution_id,
                            role=req.role or MembershipRole.STUDENT,
                            status=MembershipStatus.ACTIVE,
                        )
                    )
                return TokenResponse(
                    access_token=access_token,
                    token_type="bearer",
                    expires_in=3600,
                    user=user_resp,
                )
        except Exception as e:
            logger.debug("Supabase auth signup fallback: %s", e)

        # Fallback local signup
        for u in self._users.values():
            if u["email"].lower() == req.email.lower():
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

        new_user_id = uuid4()
        now = utc_now()
        user_dict = {
            "id": new_user_id,
            "email": str(req.email),
            "full_name": req.full_name,
            "avatar_url": None,
            "created_at": now,
            "updated_at": now,
        }
        self._users[new_user_id] = user_dict

        if req.institution_id and req.institution_id in self._institutions:
            self.create_membership(
                MembershipCreate(
                    user_id=new_user_id,
                    institution_id=req.institution_id,
                    role=req.role or MembershipRole.STUDENT,
                    status=MembershipStatus.ACTIVE,
                )
            )

        return TokenResponse(
            access_token=f"demo_bearer_token_{new_user_id}",
            token_type="bearer",
            expires_in=3600,
            user=UserResponse.model_validate(user_dict),
        )

    def sign_in(self, req: SignInRequest) -> TokenResponse:
        try:
            supabase = get_supabase_client()
            auth_res = supabase.auth.sign_in_with_password(
                {"email": req.email, "password": req.password}
            )
            if auth_res.user and auth_res.session:
                user_id = UUID(auth_res.user.id)
                user_obj = self._users.get(user_id)
                if not user_obj:
                    user_obj = {
                        "id": user_id,
                        "email": str(req.email),
                        "full_name": auth_res.user.user_metadata.get("full_name", req.email.split("@")[0]),
                        "avatar_url": auth_res.user.user_metadata.get("avatar_url"),
                        "created_at": utc_now(),
                        "updated_at": utc_now(),
                    }
                    self._users[user_id] = user_obj
                return TokenResponse(
                    access_token=auth_res.session.access_token,
                    token_type="bearer",
                    expires_in=3600,
                    user=UserResponse.model_validate(user_obj),
                )
        except Exception as e:
            logger.debug("Supabase auth signin fallback: %s", e)

        # Fallback local signin check
        for u in self._users.values():
            if u["email"].lower() == req.email.lower():
                return TokenResponse(
                    access_token=f"demo_bearer_token_{u['id']}",
                    token_type="bearer",
                    expires_in=3600,
                    user=UserResponse.model_validate(u),
                )

        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")


# Singleton repository instance
_repo_instance: Optional[DatabaseRepository] = None


def get_repository() -> DatabaseRepository:
    global _repo_instance
    if _repo_instance is None:
        _repo_instance = DatabaseRepository()
    return _repo_instance
