/** Types used by Doctor dashboard components */

export interface DoctorDashboardStats {
  totalAppointmentsToday: number;
  totalPatients: number;
  pendingRequests: number;
  reportsTaken: number;
}

export interface DoctorAppointment {
  appointmentId: number;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  checkupType: string;
  meetingLink?: string;
  status: string;
}

export interface AppointmentRequest {
  requestId: number;
  patientName: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
}

export interface CheckupTypeCountDto {
  checkupType: string;
  count: number;
}

export interface DailyAppointmentCount {
  date: string;
  count: number;
}

// ── Schedule types ─────────────────────────────────────────────────

export interface ScheduleDto {
  scheduleId: number;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface SaveDoctorScheduleDto {
  schedules: {
    scheduleDate: string;
    startTime: string;
    endTime: string;
    available: boolean;
  }[];
}

export interface DoctorScheduleResponseDto {
  doctorProfileId: string;
  doctorName: string;
  schedules: ScheduleDto[];
}
