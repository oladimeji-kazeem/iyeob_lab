import { createClient } from "@supabase/supabase-js";
import type {
  CourseOffering,
  CourseTemplate,
  Enrolment,
  Institution,
  Membership,
  UserProfile,
} from "./types";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qlrdadewzqgvrfcclfim.supabase.co";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_CBQUculxK-hOPnlfC7UYCQ_QebhjiDn";
export const SUPABASE_PROJECT_ID = "qlrdadewzqgvrfcclfim";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// API helper functions connecting via FastAPI backend or fallback direct Supabase
export async function fetchInstitutions(): Promise<Institution[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/institutions`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Attempt direct Supabase fallback
    const { data } = await supabase.from("institutions").select("*");
    if (data && data.length > 0) return data as Institution[];
  }
  return [];
}

export async function fetchCourseTemplates(): Promise<CourseTemplate[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/course-templates`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    const { data } = await supabase.from("course_templates").select("*");
    if (data && data.length > 0) return data as CourseTemplate[];
  }
  return [];
}

export async function fetchCourseOfferings(): Promise<CourseOffering[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/course-offerings`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    const { data } = await supabase.from("course_offerings").select("*");
    if (data && data.length > 0) return data as CourseOffering[];
  }
  return [];
}

export async function fetchUsers(): Promise<UserProfile[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/users`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    const { data } = await supabase.from("users").select("*");
    if (data && data.length > 0) return data as UserProfile[];
  }
  return [];
}

export async function fetchMemberships(): Promise<Membership[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/memberships`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    const { data } = await supabase.from("memberships").select("*");
    if (data && data.length > 0) return data as Membership[];
  }
  return [];
}

export async function fetchEnrolments(): Promise<Enrolment[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/enrolments`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    const { data } = await supabase.from("enrolments").select("*");
    if (data && data.length > 0) return data as Enrolment[];
  }
  return [];
}
