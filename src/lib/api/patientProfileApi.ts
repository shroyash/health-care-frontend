import { API } from "./api";

export interface PatientProfileDTO {
  patientId: number;
  fullName: string;
  email: string;
  contactNumber: string;
  status: string;
  profileImgUrl?: string;
}

export interface PatientProfileUpdateDto {
  fullname: string;
  contactNumber: string;
}

const ENDPOINT = "/patient-profiles";

// GET profile
export const getPatientProfile = async (): Promise<PatientProfileDTO> => {
  return API.getOne<PatientProfileDTO>(ENDPOINT);
};

// UPDATE profile info (without file)
export const updatePatientProfile = async (
  data: PatientProfileUpdateDto
) => {
  return API.putNoId<PatientProfileUpdateDto, void>(ENDPOINT, data);
};
export const uploadPatientProfileImage = async (
  patientId: number,
  file: File
): Promise<string> => {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  const formData = new FormData();
  formData.append("file", file);

  const url = `${process.env.NEXT_PUBLIC_API_URL}/patient-profiles/${patientId}/upload-img`;
  console.log("Uploading to:", url, file);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  console.log("Raw response:", res);

  // Check if response is ok
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Backend returned error:", errorText);
    throw new Error(`Upload failed: ${errorText}`);
  }

  // Parse JSON
  const json = await res.json();
  console.log("Backend response JSON:", json); // ✅ Here you can see the full response

  return json.data; // returns uploaded file URL
};

