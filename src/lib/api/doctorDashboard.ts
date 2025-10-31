
import { API } from "./api";
import type {
  DoctorDashboardStats,
  DoctorAppointment,
  DoctorScheduleDto,
  AppointmentRequest,
} from "../type/doctorDashboard";

export const dashboardStats = async () => {
  const res = await API.getOne<DoctorDashboardStats>("dashboard/doctor/stats");
  return res;
};

export const getTodayAppointments = async (): Promise<DoctorAppointment[]> => {
  const res = await API.getAll<DoctorAppointment>(
    "dashboard/doctor/today-appointments"
  );
  return res;
};

export const saveWeeklySchedule = async (
  dto: DoctorScheduleDto
): Promise<void> => {
  await API.create<DoctorScheduleDto, void>("/schedules/weekly", dto);
};

export const getDoctorAppointmentRequests = () =>
  API.getAll<AppointmentRequest>("/appointments/doctor");

export const updateAppointmentRequestStatus = (
  requestId: number,
  status: "ACCEPTED" | "REJECTED"
) =>
  API.create<null, AppointmentRequest>(
    `/appointments/update-status/${requestId}?status=${status}`,
    null
  );
