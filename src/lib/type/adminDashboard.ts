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
  doctorProfileId: string;  
  fullName: string;
  email: string;
  specialization: string;
  yearsOfExperience: number;
  workingAT: string;
  contactNumber: string;
  dateOfBirth: string;
  gender: string;
  country: string;
  profileImgUrl: string;
  status: string;
};

// types/adminDashboard.ts
export type PatientProfile = {
  patientId: string;
  fullName: string;
  email: string;
  profileImgUrl:string;
  dateOfBirth:string;
  gender:string;
  country:string;
  status: string;
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

export type GenderCountResponse = {
  male: number;
  female: number;
};

export type WeeklyAppointmentCountResponse = {
  day: string;
  count: number;
};

// Generic API response wrapper
export type APIResponse<T> = { success: boolean; data: T };