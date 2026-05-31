// api/doctor.api.ts
import { API } from "./api";
import {
  DoctorProfileResponseDto,
  DoctorWithScheduleDto,
  DoctorScheduleDto,
  DoctorScheduleUpdateDTO,
  DoctorScheduleResponseDto,
} from "../type/doctor.types";

// ── Doctor Profile DTO ────────────────────────────────────────────

export interface DoctorProfileUpdateDto {
  fullName?: string;
  specialization?: string;
  yearsOfExperience?: number;
  workingAT?: string;
  contactNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  country?: string;
  email?: string;
}

// ── Doctor Profile ────────────────────────────────────────────────

export const doctorProfileApi = {

  getMyProfile: () =>
    API.getOne<DoctorProfileResponseDto>(
      "/api/doctors/profile"),

  updateProfile: (data: Partial<DoctorProfileResponseDto>) =>
    API.putNoId<Partial<DoctorProfileResponseDto>,
                DoctorProfileResponseDto>(
      "/api/doctors/profile", data),

  uploadProfileImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return API.create<FormData, { profileImage: string }>(
      "/api/doctors/profile/upload-image",
      formData
    );
  },

  getAllAvailable: () =>
    API.getAll<DoctorWithScheduleDto>(
      "/api/appointments/patient/doctors/available"),
};

// ── Doctor Schedule ───────────────────────────────────────────────

export const doctorScheduleApi = {

  saveWeekly: (data: DoctorScheduleDto) =>
    API.create<DoctorScheduleDto, void>(
      "/api/schedules/weekly", data),

  getMySchedule: () =>
    API.getOne<DoctorScheduleResponseDto>(
      "/api/schedules"),

  getById: (doctorProfileId: string) =>
    API.getOne<DoctorScheduleResponseDto>(
      `/api/schedules/${doctorProfileId}`),

  update: (scheduleId: number, data: DoctorScheduleUpdateDTO) =>
    API.update<DoctorScheduleUpdateDTO, DoctorScheduleResponseDto>(
      "/api/schedules", scheduleId, data),

  delete: (scheduleId: number) =>
    API.remove("/api/schedules", scheduleId),
};

// ── Admin Doctor Management ───────────────────────────────────────

export const adminDoctorApi = {

  getAll: () =>
    API.getAll<DoctorProfileResponseDto>(
      "/api/dashboard/admin/doctors"),

  suspend: (doctorId: string) =>
    API.putNoId<void, DoctorProfileResponseDto>(
      `/api/dashboard/admin/doctors/${doctorId}/suspend`, undefined),

  restore: (doctorId: string) =>
    API.putNoId<void, DoctorProfileResponseDto>(
      `/api/dashboard/admin/doctors/${doctorId}/restore`, undefined),
};