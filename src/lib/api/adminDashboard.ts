import { API } from "./api";
import api from "./api";
import type {
  AdminDashboardStats,
  AppointmentFull,
  DoctorProfile,
  PatientProfile,
  DoctorRequest,
  DoctorRequestResponse,
  PatientStats
} from "../type/adminDashboard";

// Dashboard stats
export const getAdminDashboardStats = () =>
  API.getOne<AdminDashboardStats>("dashboard/admin/stats");

// Recent appointments
export const getRecentAppointments = () =>
  API.getAll<AppointmentFull>("dashboard/admin/recent-appointments");

// All doctors
export const getAllDoctors = () =>
  API.getAll<DoctorProfile>("dashboard/admin/doctors");

// All doctor requests
export const getAllDoctorRequests = () =>
  API.getAll<DoctorRequest>("admin/doctor-req/all");

// Pending doctor requests
export const getPendingDoctorRequests = () =>
  API.getAll<DoctorRequest>("admin/doctor-req/pending");

// Approve or reject a doctor request
export const approveOrRejectDoctor = (doctorReqId: number, approve: boolean) =>
  API.create<null, DoctorRequestResponse>(
    `admin/doctor-req/approve?doctorReqId=${doctorReqId}&approve=${approve}`,
    null
  );

export const getPendingDoctorCount = async (): Promise<number> => {
  const res = await api.get("admin/pending-doctors-count");
  // If backend returns { data: 5 }, use:
  return res.data.data; 
};



// Suspend a doctor
export const suspendDoctor = (doctorId: number) =>
  API.create<null, DoctorProfile>(
    `/doctor-profiles/suspend/${doctorId}`,
    null
  );

// Restore a suspended doctor
export const restoreDoctor = (doctorId: number) =>
  API.create<null, DoctorProfile>(
    `/doctor-profiles/restore/${doctorId}`,
    null
  );

// Suspend a patient
export const suspendPatient = (patientId: number) =>
  API.create<null, PatientProfile>(`/patient-profiles/suspend/${patientId}`, null);

// Restore a suspended patient
export const restorePatient = (patientId: number) =>
  API.create<null, PatientProfile>(`/patient-profiles/restore/${patientId}`, null);

//get all patients
export const getAllPatients = () =>
  API.getAll<PatientProfile>("dashboard/admin/patients");

export const getPatientStats = () =>
  API.getOne<PatientStats>("dashboard/admin/patients-stats");
