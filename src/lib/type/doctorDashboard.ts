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
  status:string;
}
export interface ScheduleDto {
  scheduleId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  available: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}


// types.ts
export interface SaveScheduleDto {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface SaveDoctorScheduleDto {
  schedules: SaveScheduleDto[];
}


export interface DoctorScheduleResponseDto {
  doctorName: string;
  email: string;
  specialization: string;
  contactNumber: string;
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

