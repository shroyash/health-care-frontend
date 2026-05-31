
export type ReportType = "CONSULTATION" | "LAB" | "DISCHARGE";
export type ReportStatus = "DRAFT" | "FINALIZED";

export interface MedicineForm {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface ReportMedicineDto extends MedicineForm {
  id?: number;
}

export interface ReportResponseDto {
  id: number;
  appointmentId: number;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  title: string;
  diagnosis: string;
  symptoms: string;
  treatmentPlan: string;
  notes: string;
  reportType: ReportType;
  status: ReportStatus;
  reportUrl?: string;
  medicines: ReportMedicineDto[];
  finalizedAt?: string;
  createdAt: string;
  updatedAt: string;
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