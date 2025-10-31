import { API } from "./api";
import type {
  PatientDashboardStats,
  DoctorWithSchedule,
  CreateAppointmentRequestDto,
  AppointmentRequest,
} from "../type/patientDashboard";

// Fetch upcoming appointments and total for a patient
export const getUpcomingAppointments = async (): Promise<PatientDashboardStats> =>
  API.getOne<PatientDashboardStats>("/dashboard/patient/appointments/upcoming");

// Fetch all available doctors with schedules
export const getAllAvailableDoctors = async (): Promise<DoctorWithSchedule[]> =>
  API.getAll<DoctorWithSchedule>("/dashboard/patient/available-doctor");

// Create a new appointment request
export const createAppointmentRequest = async (
  request: CreateAppointmentRequestDto
): Promise<void> =>
  API.create<CreateAppointmentRequestDto, void>("/appointments/request", request);

// Fetch all appointment requests for the current patient
export const getPatientAppointmentRequests = async (): Promise<AppointmentRequest[]> =>
  API.getAll<AppointmentRequest>("/appointments/patient");
