// lib/api/doctorDashboard.ts
import { API } from "./api";
import type {
  DoctorDashboardStats,
  DoctorAppointment,
  SaveDoctorScheduleDto,
  AppointmentRequest,
  DailyAppointmentCount,
  CheckupTypeCountDto,
  DoctorScheduleResponseDto,
} from "../type/doctorDashboard";
import api from "./api";
import { ApiResponse } from "./api";

// ----- Dashboard Stats -----
export const dashboardStats = async (): Promise<DoctorDashboardStats> => {
  return API.getOne<DoctorDashboardStats>("/dashboard/doctor");
};

// ----- Appointments -----
export const getUpcomingAppointments = async (): Promise<DoctorAppointment[]> => {
  return API.getAll<DoctorAppointment>("/dashboard/doctor/upcoming-appointments");
};

export const getAppointments = async (): Promise<DoctorAppointment[]> => {
  return API.getAll<DoctorAppointment>("/dashboard/doctor/appointments");
};

// ----- Doctor Schedule -----
export const saveWeeklySchedule = async (
  dto: SaveDoctorScheduleDto
): Promise<void> => {
  await API.create<SaveDoctorScheduleDto, void>("/schedules/weekly", dto);
};

export const getDoctorSchedule = async (): Promise<DoctorScheduleResponseDto> => {
  const response = await api.get<ApiResponse<DoctorScheduleResponseDto>>("/schedules");
  return response.data.data;
};

// ----- Appointment Requests -----
export const getDoctorAppointmentRequests = () =>
  API.getAll<AppointmentRequest>("/appointments/doctor");

export const updateAppointmentRequestStatus = (
  requestId: number,
  status: "APPROVED" | "REJECTED"
) =>
  API.patch<null, AppointmentRequest>(
    `/appointments/update-status/${requestId}?status=${status}`,
    null
  );

// ----- New Chart APIs -----

// Weekly Appointments
export const getDoctorWeeklyAppointmentCount = (): Promise<DailyAppointmentCount[]> =>
  API.getAll<DailyAppointmentCount>("/dashboard/doctor/weekly-count");

// Checkup Type Counts
export const getCheckupTypeCount = (): Promise<CheckupTypeCountDto[]> =>
  API.getAll<CheckupTypeCountDto>("/dashboard/doctor/checkup-count");