
export interface DoctorAppointmentDto {
  id: number;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  checkupType: string;
  meetingLink: string;
  status: AppointmentStatus;
}

export interface PatientAppointmentDto {
  id: number;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  checkupType: string;
  meetingLink: string;
  status: AppointmentStatus;
}

export interface AppointmentFullDto {
  id: number;
  doctorName: string;
  patientName: string;
  appointmentDate: string;
  status: AppointmentStatus;
  checkupType: string;
  meetingLink: string;
}

export interface AppointmentStatusCountDto {
  status: AppointmentStatus;
  count: number;
}

export interface DailyAppointmentCountDto {
  date: string;
  count: number;
}

export interface CheckupTypeCountDto {
  checkupType: string;
  count: number;
}

export interface MeetingAccessDto {
  appointmentId: number;
  userId: string;
  doctorName: string;
  patientName: string;
  appointmentTime: string;
  canJoin: boolean;
}

export type AppointmentStatus =
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELLED";

export type AppointmentRange = "weekly" | "monthly" | "yearly";