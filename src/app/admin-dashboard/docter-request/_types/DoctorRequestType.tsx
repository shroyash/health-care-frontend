export interface DoctorRequestType {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  experience: string;
  education: string;
  previousHospital: string;
  licenseNumber: string;
  licenseExpiry: string;
  issuingState: string;
  requestDate: string;
  status: "pending" | "under-review" | "approved" | "rejected";
  documents: {
    medicalLicense: string;
    cv: string;
    references: string;
  };
  personalStatement: string;
}