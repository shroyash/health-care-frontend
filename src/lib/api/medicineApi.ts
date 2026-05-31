import { API } from "./api";

export interface Medicine {
  id: number;
  name: string;
  description: string;
  dosage: string;
  category: string;
  sideEffects: string;
  manufacturer: string;
  addedByDoctorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineRequestDto {
  name: string;
  description: string;
  dosage: string;
  category: string;
  sideEffects: string;
  manufacturer: string;
}

export async function getAllMedicines(): Promise<Medicine[]> {
  return API.getAll<Medicine>("/api/medicines");
}

export async function addMedicine(data: MedicineRequestDto): Promise<Medicine> {
  return API.create<MedicineRequestDto, Medicine>("/api/medicines", data);
}

export async function updateMedicine(
  medicineId: number,
  data: MedicineRequestDto
): Promise<Medicine> {
  return API.update<MedicineRequestDto, Medicine>(
    "/api/medicines",
    medicineId,
    data
  );
}

export async function deleteMedicine(medicineId: number): Promise<void> {
  return API.remove("/api/medicines", medicineId);
}
