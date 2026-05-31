
import { API } from "./api";
import {
  ReportResponseDto,
  ReportRequestDto,
} from "../type/report.types";

export const reportApi = {
  create: (data: ReportRequestDto) =>
    API.create<ReportRequestDto, ReportResponseDto>(
      "/api/reports", data),

  update: (reportId: number, data: ReportRequestDto) =>
    API.update<ReportRequestDto, ReportResponseDto>(
      "/api/reports", reportId, data),

  finalize: (reportId: number) =>
    API.patch<any, ReportResponseDto>(
      `/api/reports/${reportId}/finalize`, {}),

  getById: (reportId: number) =>
    API.getOne<ReportResponseDto>(
      `/api/reports/${reportId}`),

  getByAppointment: (appointmentId: number) =>
    API.getOne<ReportResponseDto>(
      `/api/reports/appointment/${appointmentId}`),
};

export const doctorReportApi = {
  getMyReports: () =>
    API.getAll<ReportResponseDto>(
      "/api/reports/doctor"),
};

export const patientReportApi = {
  getMyReports: () =>
    API.getAll<ReportResponseDto>(
      "/api/reports/patient"),

  download: (reportId: number) =>
    `/api/reports/patient/${reportId}/download`,
};

export const adminReportApi = {
  getAll: () =>
    API.getAll<ReportResponseDto>(
      "/api/reports/admin"),
};