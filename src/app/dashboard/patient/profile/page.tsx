"use client";

import { useEffect, useState, Fragment } from "react";
import {
  getPatientProfile,
  updatePatientProfile,
  uploadPatientProfileImage,
  PatientProfileDTO,
  PatientProfileUpdateDto,
} from "@/lib/api/patientProfileApi";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import { Edit, Camera } from "lucide-react";

// API calls go through gateway, but images come directly from backend
const STATIC_BASE_URL = "http://localhost:8004"; // For serving images

export default function PatientProfilePage() {
  const [profile, setProfile] = useState<PatientProfileDTO | null>(null);
  const [form, setForm] = useState<PatientProfileUpdateDto>({
    fullname: "",
    contactNumber: "",
  });
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageKey, setImageKey] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Fetch profile from backend
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getPatientProfile();
      console.log("Profile data received:", data);
      console.log("Profile image URL:", data.profileImgUrl); // Fixed field name
      setProfile(data);
      setForm({ fullname: data.fullName, contactNumber: data.contactNumber });
      setImageError(false); // Reset error state on new fetch
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  // Save profile updates
  const handleSave = async () => {
    try {
      await updatePatientProfile(form);
      await fetchProfile();
      setEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  // Upload profile image
  const handleFileUpload = async (file: File) => {
    if (!profile) return;
    setUploading(true);

    try {
      const uploadedUrl = await uploadPatientProfileImage(profile.patientId, file);
      console.log("Uploaded image URL:", uploadedUrl);
      
      // Update profile with new image URL and force re-render
      setProfile((prev) =>
        prev ? { ...prev, profileImgUrl: uploadedUrl } : prev // Fixed field name
      );
      setImageKey(prev => prev + 1); // Force image component to reload
      setImageError(false);
    } catch (err) {
      console.error("Failed to upload image:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return <p className="p-6 text-center text-gray-500">Loading profile...</p>;

  const firstLetter = profile.fullName.charAt(0).toUpperCase();
  const fullImageUrl = profile.profileImgUrl  // Fixed field name
    ? `${STATIC_BASE_URL}${profile.profileImgUrl}` 
    : null;

  console.log("Rendering with image URL:", fullImageUrl);

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="max-w-3xl w-full space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-6">
          <div className="relative w-28 h-28">
            <div className="w-full h-full rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-700">
              {profile.profileImgUrl && !imageError ? ( // Fixed field name
                <img
                  key={imageKey}
                  src={fullImageUrl!}
                  alt={profile.fullName}
                  className="w-full h-full object-cover"
                  onLoad={() => {
                    console.log("✅ Image loaded successfully:", fullImageUrl);
                  }}
                  onError={(e) => {
                    console.error("❌ Failed to load image:", fullImageUrl);
                    console.error("Check if this URL is accessible:", fullImageUrl);
                    setImageError(true);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                firstLetter
              )}
            </div>

            {/* Hidden file input */}
            <input
              id="profile-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
              disabled={uploading}
            />
            <label
              htmlFor="profile-image-upload"
              className={`absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-2 border-white z-10 ${
                uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-blue-700"
              }`}
            >
              <Camera className="w-4 h-4 text-white" />
            </label>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold">{profile.fullName}</h1>
            <p className="text-gray-500">{profile.email}</p>
            <p className="text-sm text-gray-400 mt-1">Contact: {profile.contactNumber}</p>
            {uploading && <p className="text-sm text-blue-600 mt-1">Uploading image...</p>}
            {imageError && profile.profileImgUrl && ( // Fixed field name
              <p className="text-sm text-red-600 mt-1">
                Failed to load image. <button 
                  onClick={() => {
                    setImageError(false);
                    setImageKey(prev => prev + 1);
                  }}
                  className="underline"
                >
                  Retry
                </button>
              </p>
            )}
          </div>

          <Button variant="outline" onClick={() => setEditing(true)}>
            <Edit className="w-4 h-4 mr-2" /> Edit
          </Button>
        </div>

        {/* Debug Info - Remove in production */}
        <div className="bg-white rounded-2xl shadow p-4 text-xs text-gray-600">
          <p><strong>Debug Info:</strong></p>
          <p>Profile Image URL from API: {profile.profileImgUrl || "Not set"}</p>
          <p>Full Image URL: {fullImageUrl || "Not set"}</p>
          <p>Image Key: {imageKey}</p>
          <p>Image Error: {imageError ? "Yes" : "No"}</p>
        </div>
      </div>

      {/* Edit Modal */}
      <Transition appear show={editing} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setEditing(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
              <Dialog.Title className="text-lg font-semibold mb-4">Edit Profile</Dialog.Title>

              <div className="space-y-4">
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.fullname}
                  onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                  placeholder="Full Name"
                />
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.contactNumber}
                  onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                  placeholder="Contact Number"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button onClick={handleSave}>Save</Button>
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}