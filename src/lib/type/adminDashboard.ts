export type AdminDashboardStats = {
  totalAppointmentsToday: number;
  totalDoctors: number;
  totalPatients: number;
  pendingDoctorApprovals: number;
};

export type PatientStats = {
  activePatients: number;
  totalPatients: number;
  totalAppointments: number;
};

export interface AppointmentFull {
  appointmentId: number;
  doctorName: string;
  patientName: string;
  appointmentDate: string; // ISO string
  status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  checkupType: string;
  meetingLink: string;
}


export type DoctorProfile = {
  contactNumber: string;
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
  doctorReqId: number;
  userName: string;
  email: string;
  doctorLicence: string; 
  status: string;
};

export type DoctorRequestResponse = {
  id: number;
  message: string;
  status: string;
}; 

// Generic API response wrapper
export type APIResponse<T> = { success: boolean; data: T };