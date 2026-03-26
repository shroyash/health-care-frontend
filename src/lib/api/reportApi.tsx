import { API } from "./api";
import type { ReportRequestDto, ReportResponseDto } from "@/lib/type/report";

const ENDPOINT = "/reports";

export const reportApi = {
  // Doctor creates report
  create: (data: ReportRequestDto): Promise<ReportResponseDto> =>
    API.create<ReportRequestDto, ReportResponseDto>(ENDPOINT, data),

  // Doctor updates draft
  update: (reportId: number, data: ReportRequestDto): Promise<ReportResponseDto> =>
    API.update<ReportRequestDto, ReportResponseDto>(ENDPOINT, reportId, data),

  // Doctor finalizes report
  finalize: (reportId: number): Promise<ReportResponseDto> =>
    API.patch<{}, ReportResponseDto>(`${ENDPOINT}/${reportId}/finalize`, {}),

  // Get all reports (admin)
  getAll: (): Promise<ReportResponseDto[]> =>
    API.getAll<ReportResponseDto>(ENDPOINT),

  // Get by report id
  getById: (reportId: number): Promise<ReportResponseDto> =>
    API.getById<ReportResponseDto>(ENDPOINT, reportId),

  // Get by appointment id
  getByAppointment: (appointmentId: number): Promise<ReportResponseDto> =>
    API.getOne<ReportResponseDto>(`${ENDPOINT}/appointment/${appointmentId}`),

  // Get all reports for a patient — patientId is a UUID string
  getByPatient: (): Promise<ReportResponseDto[]> =>
    API.getAll<ReportResponseDto>(`${ENDPOINT}/patient`),

  // Get all reports for a doctor — doctorId is a UUID string
  getByDoctor: (): Promise<ReportResponseDto[]> =>
    API.getAll<ReportResponseDto>(`${ENDPOINT}/doctor`),
};