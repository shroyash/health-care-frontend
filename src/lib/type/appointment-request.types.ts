// types/appointment-request.types.ts
export interface AppointmentRequestDto {
  doctorId: string; 
  doctorName: string;
  date: string;           
  startTime: string;
  endTime: string;       
  notes?: string;
}

export interface AppointmentRequestResponseDto {
  requestId: number;
  doctorId: string;
  doctorName: string;
  patientName: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  status: AppointmentRequestStatus;
}

export interface AppointmentApprovalResponseDto {
  requestId: number;
  appointmentId: number;
  doctorId: string;
  doctorName: string;
  patientName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentRequestStatus;
  meetingLink: string;
  meetingToken: string;
}

export type AppointmentRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";