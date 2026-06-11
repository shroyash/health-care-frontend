
import { API } from "./api";
import type { PatientDashboardStatsDto } from "../type/dashboard.types";
import type { DailyAppointmentCountDto, AppointmentStatusCountDto } from "../type/appointment.types";

export async function getPatientDashboardStats(): Promise<PatientDashboardStatsDto> {
  return API.getOne<PatientDashboardStatsDto>("/api/dashboard/patient/stats");
}

export async function getPatientWeeklyCount(): Promise<DailyAppointmentCountDto[]> {
  return API.getAll<DailyAppointmentCountDto>(
    "/api/appointments/patient/range?range=weekly"
  );
}

export async function getPatientStatusCount(): Promise<AppointmentStatusCountDto[]> {
  return API.getAll<AppointmentStatusCountDto>(
    "/api/appointments/patient/status-count"
  );
}


