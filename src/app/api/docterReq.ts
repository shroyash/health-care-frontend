// docterReq.ts
import axios from "axios";
import { DoctorRequestType } from "../admin-dashboard/docter-request/_types/DoctorRequestType";

const API_BASE_URL = "http://localhost:8003/admin";

const authAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});



// Function to approve/reject doctor request
export const approveOrRejectDoctorReq = async (doctorId: number, status: string): Promise<void> => {
  await authAxios.post("/doctor-req/approve", { id: doctorId, status });
};

// Function to get all pending requests
export const getAllDoctorPendingReq = async (): Promise<DoctorRequestType[]> => {
  const res = await authAxios.get("/doctor-req/pending");
  console.log("Fetched pending doctor requests:", res.data);
  return res.data;
};
