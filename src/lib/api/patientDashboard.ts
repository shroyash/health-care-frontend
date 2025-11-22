import { API } from "./api";
import type {
  PatientDashboardStats,
  DoctorWithSchedule,
  CreateAppointmentRequestDto,
  AppointmentRequest,
} from "../type/patientDashboard";


export const getUpcomingAppointments = async (): Promise<PatientDashboardStats> =>
  API.getOne<PatientDashboardStats>("/dashboard/patient/appointments/upcoming");


export const getAllAvailableDoctors = async (): Promise<DoctorWithSchedule[]> =>
  API.getAll<DoctorWithSchedule>("/dashboard/patient/available-doctor");


export const createAppointmentRequest = async (
  request: CreateAppointmentRequestDto
): Promise<void> =>
  API.create<CreateAppointmentRequestDto, void>("/appointments/request", request);


export const getPatientAppointmentRequests = async (): Promise<AppointmentRequest[]> =>
  API.getAll<AppointmentRequest>("/appointments/patient");
