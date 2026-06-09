/**
 * Admin doctor-request API — maps to /api/admin/doctor-requests
 */

import api from "./api";
import { API } from "./api";

export interface DoctorRequestDto {
  doctorReqId: number;
  userName: string;
  email: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  doctorLicence?: string;
}

export async function getDoctorRequests(): Promise<DoctorRequestDto[]> {
  return API.getAll<DoctorRequestDto>("/api/admin/doctor-requests");
}

export async function getPendingDoctorRequests(): Promise<DoctorRequestDto[]> {
  return API.getAll<DoctorRequestDto>("/api/admin/doctor-requests/pending");
}

export async function approveDoctorRequest(
  id: number
): Promise<{ success: boolean; message: string }> {
  const res = await api.post(`/api/admin/doctor-requests/${id}/approve`);
  return { success: res.data?.status ?? true, message: res.data?.message ?? "Approved" };
}

export async function rejectDoctorRequest(
  id: number
): Promise<{ success: boolean; message: string }> {
  const res = await api.post(`/api/admin/doctor-requests/${id}/reject`);
  return { success: res.data?.status ?? true, message: res.data?.message ?? "Rejected" };
}
