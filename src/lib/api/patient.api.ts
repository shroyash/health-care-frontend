
import { API } from "./api";
import {
  PatientsStats,
  GenderCountResponseDto,
} from "../type/patient.types";

// ── Patient Profile ────────────────────────────────────────────────

export interface PatientProfileDTO {
  patientProfileId: string;
  fullName: string;
  email: string;
  contactNumber: string;
  dateOfBirth: string;
  gender: string;
  country: string;
  profileImage?: string;
  status: string;
}

export interface PatientProfileUpdateDto {
  fullName?: string;
  contactNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  country?: string;
}

export const patientProfileApi = {

  getMyProfile: () =>
    API.getOne<PatientProfileDTO>(
      "/api/patient-profiles"),

  updateProfile: (data: PatientProfileUpdateDto) =>
    API.putNoId<PatientProfileUpdateDto, PatientProfileDTO>(
      "/api/patient-profiles", data),

  uploadProfileImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return API.create<FormData, { profileImage: string }>(
      "/api/patient-profiles/upload-image",
      formData
    );
  },
};

// ── Admin Patient Management ──────────────────────────────────────

export const adminPatientApi = {

  getStats: () =>
    API.getOne<PatientsStats>(
      "/api/dashboard/admin/patients/stats"),

  getGenderCount: () =>
    API.getOne<GenderCountResponseDto>(
      "/api/dashboard/admin/patients/gender-count"),
};