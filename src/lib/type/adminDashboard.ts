export type AdminDashboardStats = {
  totalAppointmentsToday: number;
  totalDoctors: number;
  totalPatients: number;
  pendingDoctorApprovals: number;
};

export type AppointmentFull = {
  id: number;
  patientName: string;
  doctorName: string;
  appointmentTime: string;
  reason: string;
};

export type DoctorProfile = {
  doctorProfileId: number;
  fullName: string;
  email: string;
  specialization: string;
  yearsOfExperience:number;
  workingAT: string;
  status: string; // e.g., active, pending
};
// types/adminDashboard.ts
export type PatientProfile = {
  id: number;
  fullName: string;
  email: string;
  contactNumber: string;
  status: string; // active, suspended, etc.
};

export type DoctorRequest = {
  id: number;
  doctorName: string;
  email: string;
  status: string; // pending, approved, rejected
};

export type DoctorRequestResponse = {
  id: number;
  message: string;
  status: string;
};

// Generic API response wrapper
export type APIResponse<T> = { success: boolean; data: T };