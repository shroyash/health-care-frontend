// lib/api/doctorProfileApi.ts
import { API } from "./api";

// In doctorProfileApi.ts — make optional fields optional in UpdateDto
export interface DoctorProfileUpdateDto {
  fullName: string;
  email?: string;        // ✅ optional
  specialization: string;
  yearsOfExperience: number;
  workingAT: string;
  contactNumber: string;
  dateOfBirth?: string;  // ✅ optional
  gender?: string;       // ✅ optional
  country?: string;      // ✅ optional
}

export interface DoctorProfileDTO extends DoctorProfileUpdateDto {
  doctorProfileId: string;  // ✅ UUID string not number
  profileImgUrl?: string | null;
  status?: string;
}

// GET logged-in doctor's profile
export const getDoctorProfile = async () => {
  try {
    // /doctor-profiles/me expects cookie for auth
    const profile = await API.getOne<DoctorProfileDTO>("/doctor-profiles/me");
    console.log("Doctor profile fetched:", profile);
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
export const uploadDoctorProfileImage = async (doctorId: string, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    // Fixed: Added parentheses instead of template literal for fetch
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/doctor-profiles/${doctorId}/upload-img`, {
      method: "POST",
      body: formData,
      credentials: "include", // important to send cookie
    });

    if (!res.ok) {
      throw new Error(`Upload failed with status: ${res.status}`);
    }

    const json = await res.json();
    console.log("Upload response:", json);

    // Handle different response formats from backend
    if (json.status === false) {
      throw new Error(json.message || "Failed to upload doctor profile image");
    }

    // Return the image URL - try multiple possible field names
    return json.data || json.profileImgUrl || json.url || json.imageUrl;
  } catch (err) {
    console.error("Failed to upload profile image", err);
    throw err;
  }
};