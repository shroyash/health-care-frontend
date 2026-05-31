
import { API } from "./api";
import {
  DoctorAppointmentDto,
  PatientAppointmentDto,
  AppointmentFullDto,
  AppointmentStatusCountDto,
  DailyAppointmentCountDto,
  CheckupTypeCountDto,
  MeetingAccessDto,
  AppointmentRange,
} from "../type/appointment.types";
import { PageResponse } from "../type/common.types";


// ── Doctor ────────────────────────────────────────────────────────

export const doctorAppointmentApi = {

  getUpcoming: () =>
    API.getAll<DoctorAppointmentDto>(
      "/api/appointments/doctor/upcoming"),

  getAll: (page = 0, size = 10) =>
    API.getOne<PageResponse<DoctorAppointmentDto>>(
      `/api/appointments/doctor?page=${page}&size=${size}`),

  getHistory: (page = 0, size = 10) =>
    API.getOne<PageResponse<DoctorAppointmentDto>>(
      `/api/appointments/doctor/history?page=${page}&size=${size}`),

  getByRange: (range: AppointmentRange) =>
    API.getAll<DailyAppointmentCountDto>(
      `/api/appointments/doctor/range?range=${range}`),

  getCheckupCount: () =>
    API.getAll<CheckupTypeCountDto>(
      "/api/appointments/doctor/checkup-count"),
};

// ── Patient ───────────────────────────────────────────────────────

export const patientAppointmentApi = {

  getUpcoming: () =>
    API.getAll<PatientAppointmentDto>(
      "/api/appointments/patient/upcoming"),

  getAll: (page = 0, size = 10) =>
    API.getOne<PageResponse<PatientAppointmentDto>>(
      `/api/appointments/patient?page=${page}&size=${size}`),

  getHistory: (page = 0, size = 10) =>
    API.getOne<PageResponse<PatientAppointmentDto>>(
      `/api/appointments/patient/history?page=${page}&size=${size}`),

  getByRange: (range: AppointmentRange) =>
    API.getAll<DailyAppointmentCountDto>(
      `/api/appointments/patient/range?range=${range}`),

  getStatusCount: () =>
    API.getAll<AppointmentStatusCountDto>(
      "/api/appointments/patient/status-count"),
};

// ── Admin ─────────────────────────────────────────────────────────

export const adminAppointmentApi = {

  getRecent: (page = 0, size = 10) =>
    API.getOne<PageResponse<AppointmentFullDto>>(
      `/api/appointments/admin/recent?page=${page}&size=${size}`),
};

// ── Meeting Access ────────────────────────────────────────────────

export const meetingApi = {

  validateAccess: (id: number, token: string) =>
    API.getOne<MeetingAccessDto>(
      `/api/appointments/${id}/access?token=${token}`),
};