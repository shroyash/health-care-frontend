export type ReportType = "CONSULTATION" | "LAB" | "DISCHARGE";
export type ReportStatus = "DRAFT" | "FINALIZED";

export interface MedicineForm {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface ReportRequestDto {
  appointmentId: number;
  title: string;
  diagnosis: string;
  symptoms: string;
  treatmentPlan: string;
  notes: string;
  reportType: ReportType;
  medicines: MedicineForm[];
}

export interface ReportResponseDto {
  id: number;
  appointmentId: number;
  patientId: number;
  doctorId: number;
  title: string;
  diagnosis: string;
  symptoms: string;
  treatmentPlan: string;
  notes: string;
  reportType: ReportType;
  status: ReportStatus;
  reportUrl: string | null;
  medicines: MedicineForm[];
  finalizedAt: string | null;
  createdAt: string;
  updatedAt: string;
}