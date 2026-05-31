/**
 * Doctor dashboard API — compatibility shim mapping to existing
 * structured API modules (doctor.api, appointment.api, dashboard.api).
 */

import api from "./api";
import { API } from "./api";
import type {
  DoctorDashboardStats,
  DoctorAppointment,
  AppointmentRequest,
  CheckupTypeCountDto,
  DailyAppointmentCount,
  SaveDoctorScheduleDto,
  DoctorScheduleResponseDto,
} from "../type/doctorDashboard";

// ── Dashboard Stats ────────────────────────────────────────────────
export async function dashboardStats(): Promise<DoctorDashboardStats> {
  return API.getOne<DoctorDashboardStats>("/api/dashboard/doctor/stats");
}

// ── Appointments ───────────────────────────────────────────────────
export async function getUpcomingAppointments(): Promise<DoctorAppointment[]> {
  return API.getAll<DoctorAppointment>("/api/appointments/doctor/upcoming");
}

export async function getAppointments(): Promise<DoctorAppointment[]> {
  // Returns all doctor appointments (both upcoming and past)
  const res = await API.getOne<{ content: DoctorAppointment[] }>(
    "/api/appointments/doctor?page=0&size=100"
  );
  return res.content ?? [];
}

// ── Weekly / Checkup Charts ───────────────────────────────────────
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

// ── Appointment Requests ──────────────────────────────────────────
export async function getDoctorAppointmentRequests(): Promise<AppointmentRequest[]> {
  return API.getAll<AppointmentRequest>("/api/appointments/doctor/requests");
}

export async function updateAppointmentRequestStatus(
  id: number,
  status: "APPROVED" | "REJECTED"
): Promise<any> {
  const res = await api.patch(`/api/appointments/doctor/requests/${id}/status`, { status });
  return res.data;
}

// ── Schedule ──────────────────────────────────────────────────────
export async function saveWeeklySchedule(dto: SaveDoctorScheduleDto): Promise<void> {
  await api.post("/api/schedules/weekly", dto);
}

export async function getDoctorSchedule(): Promise<DoctorScheduleResponseDto> {
  return API.getOne<DoctorScheduleResponseDto>("/api/schedules");
}
