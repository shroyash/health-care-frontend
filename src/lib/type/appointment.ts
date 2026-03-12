export interface AppointmentAccess {
  appointmentId: number;
  doctorName: string;
  patientName: string;
  appointmentTime: string;
  canJoin: boolean;
  meetingLink?: string;
  meetingToken?: string;
}

export interface AppointmentRequestDto {
  requestId: number;
  status: string;
  appointmentId?: number;
  meetingLink?: string;
  meetingToken?: string;
}

export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export type DoctorCheckType = "ONLINE" | "IN_PERSON"; // adjust if your enum has different values

export interface PatientAppointmentDto {
  appointmentId: number;
  doctorId: string;
  doctorName: string;
  appointmentDate: string; // LocalDateTime → ISO string
  startTime: string;       // LocalTime → "HH:mm:ss"
  endTime: string;
  checkupType: DoctorCheckType;
  meetingLink: string;
  status: AppointmentStatus;
}

export interface DoctorAppointmentDto {
  appointmentId: number;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  checkupType: DoctorCheckType;
  meetingLink: string;
  status: AppointmentStatus;
}