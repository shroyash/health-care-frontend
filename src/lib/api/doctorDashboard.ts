import { API } from "./api";
import type { DoctorDashboardStatsDto } from "../type/dashboard.types";
import type { CheckupTypeCountDto, DailyAppointmentCountDto } from "../type/appointment.types";

export async function dashboardStats(): Promise<DoctorDashboardStatsDto> {
  return API.getOne<DoctorDashboardStatsDto>("/api/dashboard/doctor/stats");
}

export async function getDoctorWeeklyAppointmentCount(): Promise<DailyAppointmentCountDto[]> {
  return API.getAll<DailyAppointmentCountDto>(
    "/api/appointments/doctor/range?range=weekly"
  );
}

export async function getCheckupTypeCount(): Promise<CheckupTypeCountDto[]> {
  return API.getAll<CheckupTypeCountDto>(
    "/api/appointments/doctor/checkup-count"
  );
}


