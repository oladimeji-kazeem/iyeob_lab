from uuid import uuid4
from fastapi.testclient import TestClient


def test_course_template_and_offering_separation(client: TestClient):
    # 1. Create a master course template (independent of institutions and semesters)
    code = f"BIO_{uuid4().hex[:4].upper()}"
    tpl_payload = {
        "code": code,
        "title": "Computational Biology & Genomics",
        "description": "Cross-disciplinary genome informatics syllabus.",
        "credits": 4,
        "syllabus_json": {"topics": ["Sequence Alignment", "Phylogenetics"]},
    }
    tpl_res = client.post("/api/v1/course-templates", json=tpl_payload)
    assert tpl_res.status_code == 201
    tpl = tpl_res.json()
    assert tpl["code"] == code
    assert tpl["credits"] == 4
    assert "created_at" in tpl

    # 2. Get an institution
    inst_res = client.get("/api/v1/institutions")
    inst_id = inst_res.json()[0]["id"]

    # 3. Schedule a course offering for Fall 2026 with semester pricing
    off_payload = {
        "template_id": tpl["id"],
        "institution_id": inst_id,
        "semester": "Fall 2026",
        "price_cents": 50000,
        "capacity": 30,
        "is_open": True,
    }
    off_res = client.post("/api/v1/course-offerings", json=off_payload)
    assert off_res.status_code == 201
    offering = off_res.json()
    assert offering["price_cents"] == 50000
    assert offering["semester"] == "Fall 2026"
    assert "created_at" in offering

    # 4. Enrol a student into this offering
    users_res = client.get("/api/v1/users")
    student_id = users_res.json()[-1]["id"]

    enr_payload = {
        "offering_id": offering["id"],
        "student_id": student_id,
        "status": "enrolled",
        "payment_status": "paid",
        "grade": 95.0,
    }
    enr_res = client.post("/api/v1/enrolments", json=enr_payload)
    assert enr_res.status_code == 201
    enr = enr_res.json()
    assert enr["grade"] == 95.0
    assert enr["payment_status"] == "paid"
    assert "enrolled_at" in enr

    # 5. Duplicate enrolment should fail with 409
    dup_res = client.post("/api/v1/enrolments", json=enr_payload)
    assert dup_res.status_code == 409
