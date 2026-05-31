/**
 * Compatibility shim: re-exports admin API functions that admin components
 * expect from "@/lib/api/adminDashboard". These map to the structured
 * domain API files (dashboard.api, doctor.api, patient.api, appointment.api).
 */

import api from "./api";
import { API } from "./api";
import type {
  AdminDashboardStats,
  DoctorProfile,
  PatientProfile,
  PatientStats,
  AppointmentFull,
  WeeklyAppointmentCountResponse,
  GenderCountResponse,
} from "../type/adminDashboard";

// ── Dashboard Stats ────────────────────────────────────────────────
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  return API.getOne<AdminDashboardStats>("/api/dashboard/admin/stats");
}

// ── Weekly Appointments ───────────────────────────────────────────
export async function getWeeklyAppointments(): Promise<WeeklyAppointmentCountResponse[]> {
  return API.getAll<WeeklyAppointmentCountResponse>("/api/dashboard/admin/weekly-appointments");
}

// ── Recent Appointments ───────────────────────────────────────────
export async function getRecentAppointments(): Promise<AppointmentFull[]> {
  return API.getAll<AppointmentFull>("/api/appointments/admin/recent");
}

// ── Doctor Management ──────────────────────────────────────────────
export async function getPendingDoctorCount(): Promise<number> {
  return API.getOne<number>("/api/admin/doctor-requests/pending-count");
}

export async function getAllDoctors(): Promise<DoctorProfile[]> {
  return API.getAll<DoctorProfile>("/api/dashboard/admin/doctors");
}

export async function suspendDoctor(doctorId: string): Promise<void> {
  await api.put(`/api/dashboard/admin/doctors/${doctorId}/suspend`);
}

export async function restoreDoctor(doctorId: string): Promise<void> {
  await api.put(`/api/dashboard/admin/doctors/${doctorId}/restore`);
}

// ── Patient Management ────────────────────────────────────────────
export async function getAllPatients(): Promise<PatientProfile[]> {
  return API.getAll<PatientProfile>("/api/dashboard/admin/patients");
}

export async function getPatientStats(): Promise<PatientStats> {
  return API.getOne<PatientStats>("/api/dashboard/admin/patients/stats");
}

export async function suspendPatient(patientId: string): Promise<void> {
  await api.put(`/api/dashboard/admin/patients/${patientId}/suspend`);
}

export async function restorePatient(patientId: string): Promise<void> {
  await api.put(`/api/dashboard/admin/patients/${patientId}/restore`);
}

// ── Gender Stats ──────────────────────────────────────────────────
export async function getPatientsGenderCount(): Promise<GenderCountResponse> {
  return API.getOne<GenderCountResponse>("/api/dashboard/admin/patients/gender-count");
}
