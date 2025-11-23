// types/patientDashboard.ts

export interface PatientAppointment {
  appointmentId: number;
  doctorId: number;
  doctorName: string;
  appointmentDate: string; 
  startTime: string;    
  endTime: string;         
  checkupType: string;     
  meetingLink: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
}

export interface PatientDashboardStats {
  totalUpcomingAppointments: number;
  totalActiveDoctor:number;
}

export type PatientUpcomingAppointments = PatientAppointment[];


export interface DoctorWithSchedule {
  doctorProfileId: number;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  schedules: DoctorSchedule[];
}

export interface DoctorSchedule {
  dayOfWeek: string;   
  startTime: string;  
  endTime: string;    
  available: boolean;
}


export interface AppointmentRequest {
  requestId: number;
  doctorId: number;
  doctorName: string;
  patientName: string;
  day: string;        // e.g., "Monday"
  startTime: string;  // e.g., "10:00"
  endTime: string;    // e.g., "16:00"
  status: string;     // e.g., "PENDING", "APPROVED", "REJECTED"
  notes?: string;
}

export interface CreateAppointmentRequestDto {
  doctorId: number;
  day: string;
  startTime: string;
  endTime: string;
  notes?: string;
}


