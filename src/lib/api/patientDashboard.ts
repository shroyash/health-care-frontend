
import { API } from "./api";
import type { PatientDashboardStatsDto } from "../type/dashboard.types";
import type { AppointmentStatusCountDto } from "../type/appointment.types";
import type { WeeklyAppointmentCountDto } from "../type/dashboard.types";

export async function getPatientDashboardStats(): Promise<PatientDashboardStatsDto> {
  return API.getOne<PatientDashboardStatsDto>("/api/dashboard/patient/stats");
}

export async function getWeeklyAppointmentsByPatient(): Promise<WeeklyAppointmentCountDto[]> {
  return API.getAll<WeeklyAppointmentCountDto>("/api/dashboard/patient/weekly-appointments");
};

export async function getPatientStatusCount(): Promise<AppointmentStatusCountDto[]> {
  return API.getAll<AppointmentStatusCountDto>(
    "/api/appointments/patient/status-count"
  );
};


