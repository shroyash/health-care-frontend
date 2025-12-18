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
import { Edit, Camera, Briefcase, Phone, Mail, Award } from "lucide-react";

const STATIC_BASE_URL = "http://localhost:8004";

interface LabeledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const LabeledInput = ({ label, ...props }: LabeledInputProps) => (
  <div className="space-y-1 w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-600">{label}</label>
    )}
    <input
      {...props}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
    />
  </div>
);

interface DoctorProfile extends DoctorProfileUpdateDto {
  doctorProfileId: number;
}

const ProfileImage = ({
  profileImgUrl,
  previewImage,
  firstLetter,
  onFileChange,
  uploading,
  imageKey,
}: any) => {
  const fullImageUrl = profileImgUrl
    ? `${STATIC_BASE_URL}${profileImgUrl}`
    : null;

  return (
    <div className="relative">
      {previewImage ? (
        <img
          src={previewImage}
          className="w-44 h-44 rounded-full object-cover ring-4 ring-white shadow-xl"
        />
      ) : fullImageUrl ? (
        <img
          key={imageKey}
          src={fullImageUrl}
          className="w-44 h-44 rounded-full object-cover ring-4 ring-white shadow-xl"
        />
      ) : (
        <div className="w-44 h-44 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-5xl font-bold text-white shadow-xl">
          {firstLetter}
        </div>
      )}

      <label
        className={`absolute bottom-2 right-2 rounded-full p-3 bg-blue-600 text-white shadow-lg transition ${
          uploading ? "opacity-50" : "cursor-pointer hover:bg-blue-700"
        }`}
      >
        <Camera className="w-5 h-5" />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
          disabled={uploading}
        />
      </label>
    </div>
  );
};

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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageKey, setImageKey] = useState(0);

  useEffect(() => {
    getDoctorProfile().then((data: any) => {
      const doctorProfileId = data.doctorProfileId || data.id || 0;
      setProfile({ ...data, doctorProfileId });
      setFormData(data);
    });
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "yearsOfExperience" ? Number(value) : value,
    });
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    setPreviewImage(URL.createObjectURL(file));

    uploadDoctorProfileImage(profile.doctorProfileId, file)
      .then((url) => {
        setProfile((p) => (p ? { ...p, profileImgUrl: url } : p));
        setImageKey((k) => k + 1);
        setPreviewImage(null);
      })
      .finally(() => setUploading(false));
  };

  const handleSave = async () => {
    if (!profile) return;
    const updated = await updateDoctorProfile(formData);
    setProfile((p) => (p ? { ...p, ...updated } : p));
    setIsEditing(false);
  };

  if (!profile)
    return <p className="text-center mt-20 text-gray-500">Loading…</p>;

  const firstLetter = profile.fullName?.charAt(0) || "?";

  return (
    <div className="min-h-screen bg-gradient-to-br  text-black">
      {/* Hero Section */}
      <div className="relative px-10 py-20">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <ProfileImage
            profileImgUrl={profile.profileImgUrl}
            previewImage={previewImage}
            firstLetter={firstLetter}
            onFileChange={handleImageChange}
            uploading={uploading}
            imageKey={imageKey}
          />

          <div className="flex-1 text-center lg:text-left space-y-4">
            <h1 className="text-4xl font-bold">Dr. {profile.fullName}</h1>
            <p className="text-xl opacity-90">{profile.specialization}</p>

            <div className="flex flex-wrap gap-6 justify-center lg:justify-start mt-6">
              <div className="flex items-center gap-2">
                <Award /> {profile.yearsOfExperience}+ yrs experience
              </div>
              <div className="flex items-center gap-2">
                <Briefcase /> {profile.workingAT}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <div className="flex items-center gap-2 opacity-90">
                <Mail /> {profile.email}
              </div>
              <div className="flex items-center gap-2 opacity-90">
                <Phone /> {profile.contactNumber}
              </div>
            </div>

            <Button
              className="mt-8 bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Transition appear show={isEditing} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsEditing}>
          <div className="fixed inset-0 bg-black/50" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 text-gray-900">
              <Dialog.Title className="text-lg font-semibold mb-4">
                Edit Profile
              </Dialog.Title>

              <div className="space-y-3">
                <LabeledInput label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} />
                <LabeledInput label="Specialization" name="specialization" value={formData.specialization} onChange={handleChange} />
                <LabeledInput label="Years of Experience" name="yearsOfExperience" type="number" value={formData.yearsOfExperience} onChange={handleChange} />
                <LabeledInput label="Working At" name="workingAT" value={formData.workingAT} onChange={handleChange} />
                <LabeledInput label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button onClick={handleSave}>Save</Button>
                <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
