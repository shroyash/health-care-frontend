import { API } from "./api";
import type {
  AdminDashboardStats,
  AppointmentFull,
  DoctorProfile,
  PatientProfile,
  DoctorRequest,
  DoctorRequestResponse,
  PatientStats,
  GenderCountResponse,
  WeeklyAppointmentCountResponse
} from "../type/adminDashboard";

// Base URL for admin dashboard
const DASHBOARD_BASE = "dashboard/admin";

// Existing functions
export const getAdminDashboardStats = () =>
  API.getOne<AdminDashboardStats>(`${DASHBOARD_BASE}/stats`);

export const getRecentAppointments = () =>
  API.getAll<AppointmentFull>(`${DASHBOARD_BASE}/recent-appointments`);

export const getAllDoctors = () =>
  API.getAll<DoctorProfile>(`${DASHBOARD_BASE}/doctors`);

export const getAllDoctorRequests = () =>
  API.getAll<DoctorRequest>("admin/doctor-req/all");

export const getPendingDoctorRequests = () =>
  API.getAll<DoctorRequest>("admin/doctor-req/pending");

export const approveOrRejectDoctor = (doctorReqId: number, approve: boolean) =>
  API.create<null, DoctorRequestResponse>(
    `admin/doctor-req/approve?doctorReqId=${doctorReqId}&approve=${approve}`,
    null
  );

export const getPendingDoctorCount = async (): Promise<number> => {
  return API.getOne<number>("admin/pending-doctors-count");
};


export const suspendDoctor = (doctorId: string) =>
  API.putNoId<null, DoctorProfile>(`${DASHBOARD_BASE}/${doctorId}/suspend`, null);

export const restoreDoctor = (doctorId: string) =>
  API.putNoId<null, DoctorProfile>(`${DASHBOARD_BASE}/${doctorId}/restore`, null);

export const suspendPatient = (patientId: string) =>
  API.putNoId<null, PatientProfile>(`${DASHBOARD_BASE}/suspend/${patientId}`, null);

export const restorePatient = (patientId: string) =>
  API.putNoId<null, PatientProfile>(`${DASHBOARD_BASE}/restore/${patientId}`, null);

export const getAllPatients = () =>
  API.getAll<PatientProfile>(`${DASHBOARD_BASE}/patients`);

export const getPatientStats = () =>
  API.getOne<PatientStats>(`${DASHBOARD_BASE}/patients-stats`);

export const getPatientsGenderCount = () =>
  API.getOne<GenderCountResponse>(`${DASHBOARD_BASE}/patients/gender-count`);

export const getWeeklyAppointments = () =>
  API.getAll<WeeklyAppointmentCountResponse>(`${DASHBOARD_BASE}/patients/weekly-appointments`);
