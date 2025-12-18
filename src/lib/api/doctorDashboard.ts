
import { API } from "./api";
import type {
  DoctorDashboardStats,
  DoctorAppointment,
  SaveDoctorScheduleDto,
  AppointmentRequest,
} from "../type/doctorDashboard";
import api from "./api";
import { DoctorScheduleResponseDto } from "../type/doctorDashboard";
import { ApiResponse } from "./api";

export const dashboardStats = async () => {
  const res = await API.getOne<DoctorDashboardStats>("/dashboard/doctor");
  return res;
};

export const getUpcomingAppointments = async (): Promise<DoctorAppointment[]> => {
  const res = await API.getAll<DoctorAppointment>(
    "/dashboard/doctor/upcomming-appointments"
  );
  return res;
};

export const saveWeeklySchedule = async (
  dto: SaveDoctorScheduleDto
): Promise<void> => {
  await API.create<SaveDoctorScheduleDto, void>("/schedules/weekly", dto);
};

export const getDoctorSchedule = async (): Promise<DoctorScheduleResponseDto> => {
  const response = await api.get<ApiResponse<DoctorScheduleResponseDto>>(
    "/schedules"
  );
  return response.data.data;
};


export const getDoctorAppointmentRequests = () =>
  API.getAll<AppointmentRequest>("/appointments/doctor");

export const updateAppointmentRequestStatus = (
  requestId: number,
  status: "APPROVED" | "REJECTED"
) =>
  API.patch<null, AppointmentRequest>(
    `/appointments/update-status/${requestId}?status=${status}`,
    null,
    
  );
