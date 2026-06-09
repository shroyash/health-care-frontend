/**
 * Compatibility shim: re-exports and defines types that admin components
 * expect from "@/lib/type/adminDashboard". These map to types in the
 * structured domain type files.
 */

// ── Dashboard Stats ────────────────────────────────────────────────
export interface AdminDashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointmentsToday: number;
  pendingDoctorApprovals: number;
}

// ── Doctor ────────────────────────────────────────────────────────
export interface DoctorProfile {
  doctorProfileId: string;
  fullName: string;
  email: string;
  specialization?: string;
  contactNumber?: string;
  workingAT?: string;
  yearsOfExperience?: number;
  gender?: string;
  country?: string;
  dateOfBirth?: string;
  profileImgUrl?: string;
  status: "ACTIVE" | "INACTIVE" | string;
}

// ── Patient ───────────────────────────────────────────────────────
export interface PatientProfile {
  patientId: string;
  fullName: string;
  email: string;
  gender?: string | null;
  country?: string;
  dateOfBirth?: string;
  profileImgUrl?: string;
  status: string;
}

export interface PatientStats {
  activePatients: number;
  totalPatients: number;
  totalAppointments: number;
}


// ── Charts / Analytics ────────────────────────────────────────────
export interface WeeklyAppointmentCountResponse {
  day: string;
  count: number;
}

export interface GenderCountResponse {
  male: number;
  female: number;
}
