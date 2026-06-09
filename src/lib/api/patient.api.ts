
import { API } from "./api";
import {
  PatientProfileDTO,
  PatientProfileUpdateDto,
} from "../type/patient.types";


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

