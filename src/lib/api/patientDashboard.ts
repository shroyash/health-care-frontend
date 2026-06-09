
import api from "./api";
import { API } from "./api";
import type {
  PatientDashboardStats,
  DailyAppointmentCount,
  AppointmentStatusCount,

} from "../type/patientDashboard";


export async function getPatientDashboardStats(): Promise<PatientDashboardStats> {
  return API.getOne<PatientDashboardStats>("/api/dashboard/patient/stats");
}

export async function getPatientWeeklyCount(): Promise<DailyAppointmentCount[]> {
  return API.getAll<DailyAppointmentCount>(
    "/api/appointments/patient/range?range=weekly"
  );
}

export async function getPatientStatusCount(): Promise<AppointmentStatusCount[]> {
  return API.getAll<AppointmentStatusCount>(
    "/api/appointments/patient/status-count"
  );
}


