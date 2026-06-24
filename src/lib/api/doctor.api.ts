// api/doctor.api.ts
import { API } from "./api";
import { DoctorProfileResponseDto, DoctorProfileUpdateDto } from "../type/doctor.types";
import {
  DoctorScheduleResponseDto,
  DoctorWithScheduleDto,
  ScheduleDto,
} from "../type/doctor-schedule.types";

// ── Doctor Profile ────────────────────────────────────────────────

export const doctorProfileApi = {
  getMyProfile: () =>
    API.getOne<DoctorProfileResponseDto>("/api/doctor-profiles/me"),

  updateProfile: (data: DoctorProfileUpdateDto) =>
    API.putNoId<DoctorProfileUpdateDto, DoctorProfileResponseDto>(
      "/api/doctor-profiles",
      data
    ),

  uploadProfileImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return API.create<FormData, { profileImgUrl: string }>(
      "/api/doctor-profiles/upload-img",
      formData
    );
  },

  getAllAvailable: () =>
    API.getAll<DoctorWithScheduleDto>(
      "/api/appointments/patient/doctors/available"
    ),
};

// ── Doctor Schedule ───────────────────────────────────────────────

export const doctorScheduleApi = {
  saveWeekly: (data: ScheduleDto) =>
    API.create<ScheduleDto, void>("/api/schedules/weekly", data),

  getMySchedule: () =>
    API.getOne<DoctorScheduleResponseDto>("/api/schedules"),

  getById: (doctorProfileId: string) =>
    API.getOne<DoctorScheduleResponseDto>(`/api/schedules/${doctorProfileId}`),

  update: (scheduleId: number, data: ScheduleDto) =>
    API.update<ScheduleDto, DoctorScheduleResponseDto>(
      "/api/schedules",
      scheduleId,
      data
    ),

  delete: (scheduleId: number) => API.remove("/api/schedules", scheduleId),
};

// ── Admin Doctor Management ───────────────────────────────────────

export const adminDoctorApi = {
  getAll: () => API.getAll<DoctorProfileResponseDto>("/api/admin/doctors"),

  suspend: (doctorId: string, reason: string) =>
    API.post(`/api/admin/users/${doctorId}/suspend`, { reason }),

  restore: (doctorId: string) =>
    API.post(`/api/admin/users/${doctorId}/unsuspend`),
};