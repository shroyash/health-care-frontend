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

export default function PatientProfilePage() {
  const [profile, setProfile] = useState<PatientProfileDTO | null>(null);
  const [form, setForm] = useState<PatientProfileUpdateDto>({
    fullname: "",
    contactNumber: "",
  });
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getPatientProfile();
      setProfile(data);
      setForm({ fullname: data.fullName, contactNumber: data.contactNumber });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  const handleSave = async () => {
    try {
      await updatePatientProfile(form);
      await fetchProfile();
      setEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!profile) return;
    setUploading(true);

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      const uploadedUrl = await uploadPatientProfileImage(profile.patientId, file);
      console.log("Uploaded URL:", uploadedUrl);

      // Update profile image URL with timestamp to prevent caching
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              profileImageUrl: uploadedUrl + "?t=" + new Date().getTime(),
            }
          : prev
      );

      // Optional: refresh other profile data from backend
      await fetchProfile();
    } catch (err) {
      console.error("Failed to upload image:", err);
    } finally {
      setUploading(false);
    }

    // Revoke the object URL after use to free memory
    URL.revokeObjectURL(objectUrl);
  };

  if (!profile) return <p className="p-6 text-center text-gray-500">Loading profile...</p>;

  const letter = profile.fullName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="max-w-3xl w-full space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-6">
          <div className="relative w-28 h-28">
            <div className="w-full h-full rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-700">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : profile.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                letter
              )}
            </div>

            {/* Hidden file input */}
            <input
              id="profile-image-upload"
              type="file"
              className="hidden"
              onChange={(e) => {
                e.target.files && handleFileUpload(e.target.files[0]);
              }}
              disabled={uploading}
            />

            {/* Camera icon triggers file input */}
            <label
              htmlFor="profile-image-upload"
              className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-2 border-white cursor-pointer z-10"
            >
              <Camera className="w-4 h-4 text-white" />
            </label>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold">{profile.fullName}</h1>
            <p className="text-gray-500">{profile.email}</p>
            <p className="text-sm text-gray-400 mt-1">Contact: {profile.contactNumber}</p>
            {uploading && <p className="text-sm text-gray-500 mt-1">Uploading image...</p>}
          </div>

          <Button variant="outline" onClick={() => setEditing(true)}>
            <Edit className="w-4 h-4 mr-2" /> Edit
          </Button>
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
