import { API } from "./api";
import type { DoctorDashboardStatsDto, WeeklyAppointmentCountDto } from "../type/dashboard.types";
import type { CheckupTypeCountDto, DailyAppointmentCountDto } from "../type/appointment.types";

export async function dashboardStats(): Promise<DoctorDashboardStatsDto> {
  return API.getOne<DoctorDashboardStatsDto>("/api/dashboard/doctor/stats");
}


export async function getCheckupTypeCount(): Promise<CheckupTypeCountDto[]> {
  return API.getAll<CheckupTypeCountDto>(
    "/api/appointments/doctor/checkup-count"
  );
}

  export async function getWeeklyAppointmentsByDoctor(): Promise<WeeklyAppointmentCountDto[]> {
    return API.getAll<WeeklyAppointmentCountDto>("/api/dashboard/doctor/weekly-appointments");
  }





