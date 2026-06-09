
import { API } from "./api";
import type {
  AdminDashboardStats,
  PatientStats,
  WeeklyAppointmentCountResponse,
  GenderCountResponse,
} from "../type/adminDashboard";


export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  return API.getOne<AdminDashboardStats>("/api/dashboard/admin/stats");
}


export async function getWeeklyAppointments(): Promise<WeeklyAppointmentCountResponse[]> {
  return API.getAll<WeeklyAppointmentCountResponse>("/api/dashboard/admin/weekly-appointments");
}


export async function getPendingDoctorCount(): Promise<number> {
  return API.getOne<number>("/api/admin/doctor-requests/pending-count");
}


export async function getPatientStats(): Promise<PatientStats> {
  return API.getOne<PatientStats>("/api/dashboard/admin/patients/stats");
}

export async function getPatientsGenderCount(): Promise<GenderCountResponse> {
  return API.getOne<GenderCountResponse>("/api/dashboard/admin/patients/gender-count");
}
