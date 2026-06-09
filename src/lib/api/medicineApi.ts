import { API } from "./api";
import { Medicine, MedicineRequestDto } from "../type/medicine.type";

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
