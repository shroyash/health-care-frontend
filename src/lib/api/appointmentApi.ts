import { API } from "./api";
import type { DoctorAppointmentDto, PatientAppointmentDto } from "../type/appointment";

const ENDPOINT = "/appointments";

export const appointmentApi = {
 
  // Patient fetches their own history (COMPLETED + CANCELLED)
  getPatientHistory: (): Promise<PatientAppointmentDto[]> =>
    API.getAll<PatientAppointmentDto>(`${ENDPOINT}/history/patient/my`),

  // Doctor fetches their own history (COMPLETED + CANCELLED)
  getDoctorHistory: (): Promise<DoctorAppointmentDto[]> =>
    API.getAll<DoctorAppointmentDto>(`${ENDPOINT}/history/doctor/my`),
};

