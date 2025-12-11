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
