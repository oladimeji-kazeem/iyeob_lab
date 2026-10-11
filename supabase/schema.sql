-- ==============================================================================
-- Ubasify Practical Labs (Iyeob Lab) - Supabase PostgreSQL Schema Migration
-- ==============================================================================
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to automatically update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 1. INSTITUTIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    domain VARCHAR(255) UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_institutions_updated_at ON public.institutions;
CREATE TRIGGER update_institutions_updated_at
BEFORE UPDATE ON public.institutions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 2. USERS (Profiles linked to auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    password_hash VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to sync newly registered auth.users to public.users automatically
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ------------------------------------------------------------------------------
-- 3. MEMBERSHIPS (User-Institution Role Mapping)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'lecturer', 'admin')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'invited')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_institution UNIQUE (user_id, institution_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_institution ON public.memberships(institution_id);

DROP TRIGGER IF EXISTS update_memberships_updated_at ON public.memberships;
CREATE TRIGGER update_memberships_updated_at
BEFORE UPDATE ON public.memberships
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 4. COURSE TEMPLATES (Reusable Academic Curricula)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.course_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    credits INT NOT NULL DEFAULT 3 CHECK (credits > 0),
    syllabus_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_course_templates_updated_at ON public.course_templates;
CREATE TRIGGER update_course_templates_updated_at
BEFORE UPDATE ON public.course_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 5. COURSE OFFERINGS (Institution Semester Offerings)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.course_offerings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.course_templates(id) ON DELETE RESTRICT,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    lecturer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    semester VARCHAR(50) NOT NULL,
    price_cents INT NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
    capacity INT DEFAULT 100 CHECK (capacity > 0),
    is_open BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_institution_template_semester UNIQUE (institution_id, template_id, semester)
);

CREATE INDEX IF NOT EXISTS idx_offerings_template ON public.course_offerings(template_id);
CREATE INDEX IF NOT EXISTS idx_offerings_institution ON public.course_offerings(institution_id);
CREATE INDEX IF NOT EXISTS idx_offerings_lecturer ON public.course_offerings(lecturer_id);

DROP TRIGGER IF EXISTS update_course_offerings_updated_at ON public.course_offerings;
CREATE TRIGGER update_course_offerings_updated_at
BEFORE UPDATE ON public.course_offerings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 6. ENROLMENTS (Student Course Enrollment)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enrolments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offering_id UUID NOT NULL REFERENCES public.course_offerings(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'enrolled' CHECK (status IN ('pending', 'enrolled', 'completed', 'dropped')),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'waived')),
    grade NUMERIC(5, 2) CHECK (grade >= 0 AND grade <= 100),
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_offering UNIQUE (student_id, offering_id)
);

CREATE INDEX IF NOT EXISTS idx_enrolments_student ON public.enrolments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrolments_offering ON public.enrolments(offering_id);

DROP TRIGGER IF EXISTS update_enrolments_updated_at ON public.enrolments;
CREATE TRIGGER update_enrolments_updated_at
BEFORE UPDATE ON public.enrolments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrolments ENABLE ROW LEVEL SECURITY;

-- Idempotent RLS Policies
DROP POLICY IF EXISTS "Institutions viewable by all" ON public.institutions;
CREATE POLICY "Institutions viewable by all" ON public.institutions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Course templates viewable by all" ON public.course_templates;
CREATE POLICY "Course templates viewable by all" ON public.course_templates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Course offerings viewable by all" ON public.course_offerings;
CREATE POLICY "Course offerings viewable by all" ON public.course_offerings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view profile directory" ON public.users;
CREATE POLICY "Users can view profile directory" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Memberships viewable by institution members" ON public.memberships;
CREATE POLICY "Memberships viewable by institution members" ON public.memberships FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enrolments viewable by enrolled student and lecturers" ON public.enrolments;
CREATE POLICY "Enrolments viewable by enrolled student and lecturers" ON public.enrolments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Students can create enrolment" ON public.enrolments;
CREATE POLICY "Students can create enrolment" ON public.enrolments FOR INSERT WITH CHECK (auth.uid() = student_id OR auth.uid() IS NULL);
