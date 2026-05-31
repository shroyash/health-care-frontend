
import { API } from "./api";
import {
  AppointmentRequestDto,
  AppointmentRequestResponseDto,
  AppointmentApprovalResponseDto,
  AppointmentRequestStatus,
} from "../type/appointment-request.types";

// ── Patient ───────────────────────────────────────────────────────

export const patientAppointmentRequestApi = {

  create: (data: AppointmentRequestDto) =>
    API.create<AppointmentRequestDto, void>(
      "/api/appointment-requests/patient", data),

  getMyRequests: () =>
    API.getAll<AppointmentRequestResponseDto>(
      "/api/appointment-requests/patient"),
};

// ── Doctor ────────────────────────────────────────────────────────

export const doctorAppointmentRequestApi = {

  getIncoming: () =>
    API.getAll<AppointmentRequestResponseDto>(
      "/api/appointment-requests/doctor"),

  updateStatus: (requestId: number, status: AppointmentRequestStatus) =>
    API.patch<{ status: AppointmentRequestStatus },
              AppointmentApprovalResponseDto>(
      `/api/appointment-requests/doctor/${requestId}/status`,
      { status }),
};