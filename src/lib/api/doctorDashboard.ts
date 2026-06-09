import api from "./api";
import { API } from "./api";
import type {
  DoctorDashboardStats,
  CheckupTypeCountDto,
  DailyAppointmentCount,
  SaveDoctorScheduleDto,
  DoctorScheduleResponseDto,
} from "../type/doctorDashboard";

export async function dashboardStats(): Promise<DoctorDashboardStats> {
  return API.getOne<DoctorDashboardStats>("/api/dashboard/doctor/stats");
}


export async function getDoctorWeeklyAppointmentCount(): Promise<DailyAppointmentCount[]> {
  return API.getAll<DailyAppointmentCount>(
    "/api/appointments/doctor/range?range=weekly"
  );
}

export async function getCheckupTypeCount(): Promise<CheckupTypeCountDto[]> {
  return API.getAll<CheckupTypeCountDto>(
    "/api/appointments/doctor/checkup-count"
  );
}


