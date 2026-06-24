import { API } from "./api";
import {
  PatientProfileDTO,
  PatientProfileUpdateDto,
} from "../type/patient.types";

export const patientProfileApi = {
  getMyProfile: () =>
    API.getOne<PatientProfileDTO>("/api/patient-profiles"),

  updateProfile: (data: PatientProfileUpdateDto) =>
    API.putNoId<PatientProfileUpdateDto, PatientProfileDTO>(
      "/api/patient-profiles",
      data
    ),

  uploadProfileImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return API.create<FormData, { profileImgUrl: string }>(
      "/api/patient-profiles/upload-img",
      formData
    );
  },
};

export const adminPatientApi = {
  getAll: () => API.getAll<PatientProfileDTO>("/api/admin/patients"),

  suspend: (patientId: string, reason: string) =>
    API.post(`/api/admin/users/${patientId}/suspend`, { reason }),

  restore: (patientId: string) =>
    API.post(`/api/admin/users/${patientId}/unsuspend`),
};