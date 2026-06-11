// types/dashboard.types.ts
export interface AdminDashboardStatsDto {
  totalAppointmentsToday: number;
  totalDoctors: number;
  totalPatients: number;
  pendingDoctorApprovals: number;
}

export interface DoctorDashboardStatsDto {
  totalAppointmentsToday: number;
  totalPatients: number;
  pendingRequests: number;
  reportsTaken: number;
}

export interface PatientDashboardStatsDto {
  totalUpcomingAppointments: number;
  totalActiveDoctors: number;
  totalReportsWritten: number;
}

export interface WeeklyAppointmentCountDto {
  day: string;
  count: number;
}

export interface GenderCountResponseDto {
  gender: "MALE" | "FEMALE";
  count: number;
}