export interface Institution {
  id: string;
  name: string;
  code: string;
  domain: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type MembershipRole = "student" | "lecturer" | "admin";
export type MembershipStatus = "active" | "suspended" | "invited";

export interface Membership {
  id: string;
  user_id: string;
  institution_id: string;
  role: MembershipRole;
  status: MembershipStatus;
  created_at: string;
  updated_at: string;
}

export interface CourseTemplate {
  id: string;
  code: string;
  title: string;
  description: string | null;
  credits: number;
  syllabus_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface CourseOffering {
  id: string;
  template_id: string;
  institution_id: string;
  lecturer_id: string | null;
  semester: string;
  price_cents: number;
  capacity: number;
  is_open: boolean;
  created_at: string;
  updated_at: string;
}

export type EnrolmentStatus = "pending" | "enrolled" | "completed" | "dropped";
export type PaymentStatus = "unpaid" | "paid" | "refunded" | "waived";

export interface Enrolment {
  id: string;
  offering_id: string;
  student_id: string;
  status: EnrolmentStatus;
  payment_status: PaymentStatus;
  grade: number | null;
  enrolled_at: string;
  updated_at: string;
}

export interface AuthSession {
  user: UserProfile;
  access_token: string;
  token_type: string;
}
