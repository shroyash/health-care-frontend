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


export const getAdminDashboardStats = () =>
  API.getOne<AdminDashboardStats>("dashboard/admin/stats");

export const getRecentAppointments = () =>
  API.getAll<AppointmentFull>("dashboard/admin/recent-appointments");

export const getAllDoctors = () =>
  API.getAll<DoctorProfile>("dashboard/admin/doctors");

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
  const res = await api.get("admin/pending-doctors-count");
  return res.data.data; 
};


export const suspendDoctor = (doctorId: number) =>
  API.putNoId<null, DoctorProfile>(
    `/dashboard/admin/${doctorId}/suspend`,
    null
  );



export const restoreDoctor = (doctorId: number) =>
  API.putNoId<null, DoctorProfile>(
    `/dashboard/admin/${doctorId}/restore`,
    null
  );

export const suspendPatient = (patientId: number) =>
  API.putNoId<null, PatientProfile>(`/dashboard/admin/suspend/${patientId}`, null);


export const restorePatient = (patientId: number) =>
  API.putNoId<null, PatientProfile>(`/dashboard/admin/restore/${patientId}`, null);


export const getAllPatients = () =>
  API.getAll<PatientProfile>("dashboard/admin/patients");

export const getPatientStats = () =>
  API.getOne<PatientStats>("dashboard/admin/patients-stats");
