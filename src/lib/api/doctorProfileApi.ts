// lib/api/doctorProfileApi.ts
import { API } from "./api";

export interface DoctorProfileUpdateDto {
  fullName: string;
  email: string;
  specialization: string;
  yearsOfExperience: number;
  workingAT: string;
  contactNumber: string;
}

// GET logged-in doctor's profile
export const getDoctorProfile = async () => {
  try {
    // /doctor-profiles/me expects cookie for auth
    const profile = await API.getOne<DoctorProfileUpdateDto>("/doctor-profiles/me");
    return profile;
  } catch (err) {
    console.error("Failed to fetch doctor profile", err);
    throw err;
  }
};

// PUT update doctor profile (no ID in path)
export const updateDoctorProfile = async (data: DoctorProfileUpdateDto) => {
  try {
    const updated = await API.putNoId<DoctorProfileUpdateDto, DoctorProfileUpdateDto>(
      "/doctor-profiles",
      data
    );
    return updated;
  } catch (err) {
    console.error("Failed to update doctor profile", err);
    throw err;
  }
};

// POST upload doctor profile image
export const uploadDoctorProfileImage = async (doctorId: number, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/doctor-profiles/${doctorId}/upload-img`, {
      method: "POST",
      body: formData,
      credentials: "include", // important to send cookie
    });

    const json = await res.json();

    if (!json.status) {
      throw new Error(json.message || "Failed to upload doctor profile image");
    }

    return json.data; // uploaded image URL
  } catch (err) {
    console.error("Failed to upload profile image", err);
    throw err;
  }
};
