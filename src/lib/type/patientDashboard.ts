/** Types used by Patient dashboard components */

export interface PatientDashboardStats {
  totalUpcomingAppointments: number;
  totalActiveDoctor: number;
  totalReportWritten: number;
}

export interface PatientAppointment {
  appointmentId: number;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  checkupType: string;
  meetingLink?: string;
  status: "SCHEDULED" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | string;
}

export interface DailyAppointmentCount {
  date: string;
  count: number;
}

export interface AppointmentStatusCount {
  status: string;
  count: number;
}

export interface DoctorSchedule {
  scheduleId?: number;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface DoctorWithSchedule {
  doctorProfileId: string;
  name: string;
  profileUrl?: string;
  specialty: string;
  email: string;
  phone?: string;
  schedules: DoctorSchedule[];
}

export interface CreateAppointmentRequestDto {
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}
