// types.ts
export type DoctorDashboardStats = {
  totalAppointmentsToday: number;
  pendingRequests: number;
  totalPatients: number;
  totalPatientsThisWeek: number;
  reportsThisMonth: number;
};

export interface DoctorAppointment {
  appointmentId: number;
  patientId: number;
  patientName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  checkupType: string;
  meetingLink: string;
}

export interface ScheduleDto {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface DoctorScheduleDto {
  schedules: ScheduleDto[];
}

// types/appointmentRequest.ts
export interface AppointmentRequest {
  requestId: number;
  doctorId: number;
  doctorName: string;
  patientName: string;
  day: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  notes?: string;
}

