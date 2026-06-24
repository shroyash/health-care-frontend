"use client";

import React, { useEffect, useState, Fragment } from "react";
import { doctorProfileApi } from "@/lib/api/doctor.api";
import type { DoctorProfileResponseDto, DoctorProfileUpdateDto } from "@/lib/type/doctor.types";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import { Edit, Camera, Briefcase, Phone, Mail, Award, MapPin, Calendar, User } from "lucide-react";

// Falls back to localhost for local dev, but should be set per-environment.
const STATIC_BASE_URL = process.env.NEXT_PUBLIC_STATIC_BASE_URL ?? "http://localhost:8004";

interface LabeledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const LabeledInput = ({ label, ...props }: LabeledInputProps) => (
  <div className="space-y-1 w-full">
    {label && <label className="block text-sm font-medium text-gray-600">{label}</label>}
    <input
      {...props}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
    />
  </div>
);

interface LabeledSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const LabeledSelect = ({ label, children, ...props }: LabeledSelectProps) => (
  <div className="space-y-1 w-full">
    {label && <label className="block text-sm font-medium text-gray-600">{label}</label>}
    <select
      {...props}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
    >
      {children}
    </select>
  </div>
);

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number | null }) => {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-blue-500">{icon}</span>
      <span className="text-gray-500 font-medium w-36 shrink-0">{label}</span>
      <span className="text-gray-800">{value}</span>
    </div>
  );
};

interface ProfileImageProps {
  profileImgUrl?: string | null;
  previewImage: string | null;
  firstLetter: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  imageKey: number;
}

const ProfileImage = ({ profileImgUrl, previewImage, firstLetter, onFileChange, uploading, imageKey }: ProfileImageProps) => {
  // profileImgUrl may already be a full URL (e.g. S3/CDN) or a relative path
  // served by the API. Only prefix with STATIC_BASE_URL when relative.
  const fullImageUrl = profileImgUrl
    ? profileImgUrl.startsWith("http")
      ? profileImgUrl
      : `${STATIC_BASE_URL}${profileImgUrl}`
    : null;

  return (
    <div className="relative">
      {previewImage ? (
        <img src={previewImage} className="w-44 h-44 rounded-full object-cover ring-4 ring-white shadow-xl" />
      ) : fullImageUrl ? (
        <img key={imageKey} src={fullImageUrl} className="w-44 h-44 rounded-full object-cover ring-4 ring-white shadow-xl" />
      ) : (
        <div className="w-44 h-44 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-5xl font-bold text-white shadow-xl">
          {firstLetter}
        </div>
      )}
      <label className={`absolute bottom-2 right-2 rounded-full p-3 bg-blue-600 text-white shadow-lg transition ${uploading ? "opacity-50" : "cursor-pointer hover:bg-blue-700"}`}>
        <Camera className="w-5 h-5" />
        <input type="file" accept="image/*" className="hidden" onChange={onFileChange} disabled={uploading} />
      </label>
    </div>
  );
};

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<DoctorProfileResponseDto | null>(null);
  const [formData, setFormData] = useState<DoctorProfileUpdateDto>({
    fullName: "",
    email: "",
    specialization: "",
    yearsOfExperience: 0,
    workingAT: "",
    contactNumber: "",
    gender: "",
    dateOfBirth: "",
    country: "",
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageKey, setImageKey] = useState(0);

  useEffect(() => {
    doctorProfileApi.getMyProfile().then((data: DoctorProfileResponseDto) => {
      setProfile(data);
      setFormData({
        fullName: data.fullName ?? "",
        email: data.email ?? "",
        specialization: data.specialization ?? "",
        yearsOfExperience: data.yearsOfExperience ?? 0,
        workingAT: data.workingAT ?? "",
        contactNumber: data.contactNumber ?? "",
        gender: data.gender ?? "",
        dateOfBirth: data.dateOfBirth ?? "",
        country: data.country ?? "",
      });
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "yearsOfExperience" ? Number(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setPreviewImage(URL.createObjectURL(file));
    doctorProfileApi
      .uploadProfileImage(file)
      .then((response: { profileImgUrl: string }) => {
        setProfile((p) => (p ? { ...p, profileImgUrl: response.profileImgUrl } : p));
        setImageKey((k) => k + 1);
        setPreviewImage(null);
      })
      .finally(() => setUploading(false));
  };

  const handleSave = async () => {
    if (!profile) return;
    const updated = await doctorProfileApi.updateProfile(formData);
    setProfile((p) => (p ? { ...p, ...updated } : p));
    setIsEditing(false);
  };

  if (!profile) return <p className="text-center mt-20 text-gray-500">Loading…</p>;

  const firstLetter = profile.fullName?.charAt(0) || "?";
  const formattedDob = profile.dateOfBirth
    ? new Date(profile.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br text-black">
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
            <div className="flex items-center gap-3 justify-center lg:justify-start flex-wrap">
              <h1 className="text-4xl font-bold">Dr. {profile.fullName}</h1>
              {profile.status && (
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  profile.status === "ACTIVE"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}>
                  {profile.status}
                </span>
              )}
            </div>

            <p className="text-xl opacity-90">{profile.specialization}</p>

            <div className="flex flex-wrap gap-6 justify-center lg:justify-start mt-4 text-sm opacity-90">
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4" /> {profile.yearsOfExperience}+ yrs experience
              </span>
              <span className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> {profile.workingAT}
              </span>
              {profile.gender && (
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" /> {profile.gender.charAt(0) + profile.gender.slice(1).toLowerCase()}
                </span>
              )}
              {profile.country && (
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {profile.country}
                </span>
              )}
              {formattedDob && (
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> {formattedDob}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-4 opacity-90">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> {profile.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> {profile.contactNumber}
              </div>
            </div>

            <Button className="mt-8 bg-white text-blue-600 hover:bg-gray-100" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-10 pb-16">
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Doctor Details</h2>
          <InfoRow icon={<Mail className="w-4 h-4" />}      label="Email"          value={profile.email} />
          <InfoRow icon={<Phone className="w-4 h-4" />}     label="Contact"        value={profile.contactNumber} />
          <InfoRow icon={<Award className="w-4 h-4" />}     label="Specialization" value={profile.specialization} />
          <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Working At"     value={profile.workingAT} />
          <InfoRow icon={<Award className="w-4 h-4" />}     label="Experience"     value={profile.yearsOfExperience ? `${profile.yearsOfExperience} years` : null} />
          <InfoRow icon={<User className="w-4 h-4" />}      label="Gender"         value={profile.gender ? profile.gender.charAt(0) + profile.gender.slice(1).toLowerCase() : null} />
          <InfoRow icon={<Calendar className="w-4 h-4" />}  label="Date of Birth"  value={formattedDob} />
          <InfoRow icon={<MapPin className="w-4 h-4" />}    label="Country"        value={profile.country} />
        </div>
      </div>

      <Transition appear show={isEditing} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsEditing}>
          <div className="fixed inset-0 bg-black/50" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 text-gray-900">
              <Dialog.Title className="text-lg font-semibold mb-4">Edit Profile</Dialog.Title>
              <div className="space-y-3">
                <LabeledInput label="Full Name"           name="fullName"          value={formData.fullName}          onChange={handleChange} />
                <LabeledInput label="Specialization"      name="specialization"    value={formData.specialization}    onChange={handleChange} />
                <LabeledInput label="Years of Experience" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} type="number" />
                <LabeledInput label="Working At"          name="workingAT"         value={formData.workingAT}         onChange={handleChange} />
                <LabeledInput label="Contact Number"      name="contactNumber"     value={formData.contactNumber}     onChange={handleChange} />
                <LabeledSelect label="Gender" name="gender" value={formData.gender ?? ""} onChange={handleChange}>
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </LabeledSelect>
                <LabeledInput label="Date of Birth"       name="dateOfBirth"       value={formData.dateOfBirth ?? ""} onChange={handleChange} type="date" />
                <LabeledInput label="Country"             name="country"           value={formData.country ?? ""}     onChange={handleChange} />
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