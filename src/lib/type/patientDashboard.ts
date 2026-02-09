// Appointment that a patient has
export interface PatientAppointment {
  appointmentId: number;
  doctorId: string;       // UUID as string
  doctorName: string;
  appointmentDate: string; // ISO date string "2026-02-08T00:00:00"
  startTime: string;       // "10:00:00"
  endTime: string;         // "11:00:00"
  checkupType: string;
  meetingLink: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
}

// Dashboard stats
export interface PatientDashboardStats {
  totalUpcomingAppointments: number;
  totalActiveDoctor: number;
}

// List of upcoming appointments
export type PatientUpcomingAppointments = PatientAppointment[];

// Doctor with schedules
export interface DoctorWithSchedule {
  doctorProfileId: string;  // UUID
  name: string;
  specialty: string;
  email: string;
  phone: string;
  schedules: DoctorSchedule[];
}

// Schedule object for a doctor
export interface DoctorSchedule {
  date: string;        // "2026-02-08" instead of dayOfWeek
  startTime: string;   // "10:00"
  endTime: string;     // "11:00"
  available: boolean;  // true if available
}

// Appointment request DTO for sending from frontend to backend
export interface CreateAppointmentRequestDto {
  doctorId: string;    // UUID as string
  date: string;        // "2026-02-08"
  startTime: string;   // "10:00:00"
  endTime: string;     // "11:00:00"
  notes?: string;
}

// types/appointment.ts

export interface AppointmentRequest{
  doctorId: string;          // UUID as string
  doctorName: string;
  patientName: string;
  date: string;              // "2026-02-08"
  startTime: string;         // "10:00:00"
  endTime: string;           // "11:00:00"
  status: string;            // e.g., "PENDING", "APPROVED", "REJECTED"
  notes?: string | null;
  requestId?: number | null;
  appointmentId?: number | null;
  meetingLink?: string | null;
  meetingToken?: string | null;
}
