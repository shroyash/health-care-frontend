"use client";

import React, { useEffect, useState, Fragment } from "react";
import {
  getDoctorProfile,
  updateDoctorProfile,
  uploadDoctorProfileImage,
  DoctorProfileUpdateDto,
} from "@/lib/api/doctorProfileApi";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import { Edit, Camera } from "lucide-react";

interface LabeledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const LabeledInput = ({ label, ...props }: LabeledInputProps) => (
  <div className="space-y-1 w-full">
    {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
    <input
      {...props}
      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

interface DoctorProfile extends DoctorProfileUpdateDto {
  doctorProfileId: number;
  profileImageUrl?: string;
}

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [formData, setFormData] = useState<DoctorProfileUpdateDto>({
    fullName: "",
    email: "",
    specialization: "",
    yearsOfExperience: 0,
    workingAT: "",
    contactNumber: "",
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getDoctorProfile();
        setProfile({ ...data, doctorProfileId: (data as any).doctorProfileId || 0 });
        setFormData(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === "yearsOfExperience" ? Number(value) : value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProfileImageFile(file);
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      const updated = await updateDoctorProfile(formData);
      setProfile(prev => ({ ...prev, ...updated }));
      setFormData(updated);
      setIsEditing(false);

      if (profileImageFile) {
        setUploading(true);
        const uploadedUrl = await uploadDoctorProfileImage(profile.doctorProfileId, profileImageFile);
        setProfile(prev => prev ? { ...prev, profileImageUrl: uploadedUrl + "?t=" + Date.now() } : prev);
        setPreviewImage(null);
        setProfileImageFile(null);
        setUploading(false);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setUploading(false);
    }
  };

  if (!profile) return <p className="p-6 text-center text-gray-500">Loading profile...</p>;

  const firstLetter = profile.fullName?.charAt(0).toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-start">
      <div className="max-w-4xl w-full space-y-6">
        {/* Profile Card */}
        <div className="bg-white shadow-xl rounded-2xl p-6 relative">
          <div className="flex items-start space-x-6">
            {/* Profile Image */}
            <div className="relative">
              {previewImage ? (
                <img src={previewImage} alt="Profile Preview" className="w-28 h-28 rounded-full object-cover border-4 border-blue-500" />
              ) : profile.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-blue-500" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gray-200 border-4 border-blue-500 flex items-center justify-center text-3xl font-bold text-gray-700">
                  {firstLetter}
                </div>
              )}

              <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer border-2 border-white">
                <Camera className="w-4 h-4 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={uploading} />
              </label>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
              <p className="text-gray-500 text-sm">Email: {profile.email}</p>
              <p className="text-gray-500 text-sm">Specialization: {profile.specialization}</p>
              <p className="text-gray-400 text-sm mt-1">Experience: {profile.yearsOfExperience} years</p>
              <p className="text-gray-500 text-sm">Working At: {profile.workingAT}</p>
              <p className="text-gray-500 text-sm">Contact: {profile.contactNumber}</p>
              <p className="text-gray-400 text-xs mt-1">Profile ID: {profile.doctorProfileId}</p>
            </div>

            {/* Edit Button */}
            <div className="ml-auto">
              <Button variant="outline" onClick={() => setIsEditing(true)} className="flex items-center space-x-2">
                <Edit className="w-4 h-4" /> <span>Edit</span>
              </Button>
            </div>
          </div>

          {uploading && <p className="mt-4 text-sm text-gray-500">Uploading image...</p>}
        </div>
      </div>

      {/* Edit Modal */}
      <Transition appear show={isEditing} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsEditing(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                  <Dialog.Title className="text-xl font-semibold text-gray-900 mb-4">
                    Edit Profile
                  </Dialog.Title>

                  <div className="flex flex-col items-center space-y-4">
                    {/* Editable Fields */}
                    <LabeledInput label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} />
                    <LabeledInput label="Specialization" name="specialization" value={formData.specialization} onChange={handleChange} />
                    <LabeledInput label="Years of Experience" name="yearsOfExperience" type="number" value={formData.yearsOfExperience} onChange={handleChange} />
                    <LabeledInput label="Working At" name="workingAT" value={formData.workingAT} onChange={handleChange} />
                    <LabeledInput label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
                  </div>

                  <div className="mt-6 flex justify-end space-x-2">
                    <Button onClick={handleSave}>Save</Button>
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
