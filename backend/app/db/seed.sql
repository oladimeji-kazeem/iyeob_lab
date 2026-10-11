-- ==============================================================================
-- Ubasify Practical Labs - Supabase Seed Data
-- ==============================================================================

-- 1. Institutions
INSERT INTO public.institutions (id, name, code, domain, is_active)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'Massachusetts Institute of Practical Technology', 'MIPT', 'mipt.edu', true),
    ('00000000-0000-0000-0000-000000000002', 'London Practical Academy', 'LPA', 'lpa.ac.uk', true)
ON CONFLICT (code) DO NOTHING;

-- 2. Users
INSERT INTO public.users (id, email, full_name, avatar_url)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'admin@ubasify.edu', 'Dr. Ada Lovelace', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
    ('10000000-0000-0000-0000-000000000002', 'lecturer@mipt.edu', 'Prof. Alan Turing', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
    ('10000000-0000-0000-0000-000000000003', 'student@mipt.edu', 'Kazeem Oladimeji', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150')
ON CONFLICT (email) DO NOTHING;

-- 3. Memberships
INSERT INTO public.memberships (id, user_id, institution_id, role, status)
VALUES
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'admin', 'active'),
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'lecturer', 'active'),
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'student', 'active')
ON CONFLICT (user_id, institution_id) DO NOTHING;

-- 4. Course Templates
INSERT INTO public.course_templates (id, code, title, description, credits, syllabus_json)
VALUES
    (
        '30000000-0000-0000-0000-000000000001',
        'CS101',
        'Foundations of Computer Systems & Networks',
        'In-depth laboratory on operating systems, network topologies, and distributed synchronization.',
        4,
        '{"modules": ["Memory Architecture", "Concurrency Primitives", "Socket Programming"]}'::jsonb
    ),
    (
        '30000000-0000-0000-0000-000000000002',
        'SE202',
        'Full-Stack Distributed Engineering',
        'Design patterns for modern scalable web architectures, databases, and microservices.',
        3,
        '{"modules": ["REST & GraphQL", "Database Indexing & RLS", "Message Queues"]}'::jsonb
    )
ON CONFLICT (code) DO NOTHING;

-- 5. Course Offerings
INSERT INTO public.course_offerings (id, template_id, institution_id, lecturer_id, semester, price_cents, capacity, is_open)
VALUES
    (
        '40000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000002',
        'Fall 2026',
        35000,
        50,
        true
    ),
    (
        '40000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000002',
        'Fall 2026',
        42000,
        40,
        true
    )
ON CONFLICT (institution_id, template_id, semester) DO NOTHING;

-- 6. Enrolments
INSERT INTO public.enrolments (id, offering_id, student_id, status, payment_status, grade)
VALUES
    (
        '50000000-0000-0000-0000-000000000001',
        '40000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000003',
        'enrolled',
        'paid',
        92.50
    )
ON CONFLICT (student_id, offering_id) DO NOTHING;
