/**
 * Patient dashboard API — compatibility shim mapping to existing
 * structured API modules (appointment.api, doctor.api, appointment-request.api).
 */

import api from "./api";
import { API } from "./api";
import type {
  PatientDashboardStats,
  PatientAppointment,
  DailyAppointmentCount,
  AppointmentStatusCount,
  DoctorWithSchedule,
  CreateAppointmentRequestDto,
} from "../type/patientDashboard";

// ── Dashboard Stats ────────────────────────────────────────────────
export async function getPatientDashboardStats(): Promise<PatientDashboardStats> {
  return API.getOne<PatientDashboardStats>("/api/dashboard/patient/stats");
}

// ── Appointments ───────────────────────────────────────────────────
export async function getUpcomingAppointments(): Promise<PatientAppointment[]> {
  return API.getAll<PatientAppointment>("/api/appointments/patient/upcoming");
}

export async function getAppointments(): Promise<PatientAppointment[]> {
  const res = await API.getOne<{ content: PatientAppointment[] }>(
    "/api/appointments/patient?page=0&size=100"
  );
  return res.content ?? [];
}

// ── Chart Data ────────────────────────────────────────────────────
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

// ── Available Doctors ─────────────────────────────────────────────
export async function getAllAvailableDoctors(): Promise<DoctorWithSchedule[]> {
  return API.getAll<DoctorWithSchedule>(
    "/api/appointments/patient/doctors/available"
  );
}

// ── Appointment Requests ──────────────────────────────────────────
export async function createAppointmentRequest(
  dto: CreateAppointmentRequestDto
): Promise<void> {
  await api.post("/api/appointments/patient/requests", dto);
}
