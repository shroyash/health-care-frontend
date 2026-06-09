import { API } from "./api";
import { DoctorProfileResponseDto, DoctorWithScheduleDto } from "../type/doctor.types";

export const patientDoctorApi = {
  getAvailable: () =>
    API.getAll<DoctorWithScheduleDto>("/api/appointments/patient/doctors/available"),

  getBySpecialization: (specialization: string) =>
    API.getAll<DoctorProfileResponseDto>(
      `/api/appointments/patient/doctors/specialization?specialization=${specialization}`
    ),

  getByExperience: (level: string) =>
    API.getAll<DoctorProfileResponseDto>(
      `/api/appointments/patient/doctors/experience?level=${level}`
    ),
};