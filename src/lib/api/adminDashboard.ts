
import { API } from "./api";
import type {
  AdminDashboardStatsDto,
  PatientDashboardStatsDto,
  WeeklyAppointmentCountDto,
  GenderCountResponseDto,
} from "../type/dashboard.types";

export async function getAdminDashboardStats(): Promise<AdminDashboardStatsDto> {
  return API.getOne<AdminDashboardStatsDto>("/api/dashboard/admin/stats");
}

export async function getWeeklyAppointments(): Promise<WeeklyAppointmentCountDto[]> {
  return API.getAll<WeeklyAppointmentCountDto>("/api/dashboard/admin/weekly-appointments");
}

export async function getPendingDoctorCount(): Promise<number> {
  return API.getOne<number>("/api/admin/doctor-requests/pending-count");
}

export async function getPatientStats(): Promise<PatientDashboardStatsDto> {
  return API.getOne<PatientDashboardStatsDto>("/api/dashboard/admin/patients/stats");
}
getWeeklyAppointments
export async function getPatientsGenderCount(): Promise<GenderCountResponseDto[]> {
  return API.getOne<GenderCountResponseDto[]>("/api/admin/users/gender-count");
}
