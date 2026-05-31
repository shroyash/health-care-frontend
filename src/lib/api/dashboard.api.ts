// api/dashboard.api.ts
import { API } from "./api";
import {
  AdminDashboardStatsDto,
  DoctorDashboardStatsDto,
  PatientDashboardStatsDto,
  WeeklyAppointmentCountDto,
} from "../type/dashboard.types";

export const adminDashboardApi = {

  getStats: () =>
    API.getOne<AdminDashboardStatsDto>(
      "/api/dashboard/admin/stats"),

  getWeeklyAppointments: () =>
    API.getAll<WeeklyAppointmentCountDto>(
      "/api/dashboard/admin/weekly-appointments"),
};

export const doctorDashboardApi = {

  getStats: () =>
    API.getOne<DoctorDashboardStatsDto>(
      "/api/dashboard/doctor/stats"),
};

export const patientDashboardApi = {

  getStats: () =>
    API.getOne<PatientDashboardStatsDto>(
      "/api/dashboard/patient/stats"),
};