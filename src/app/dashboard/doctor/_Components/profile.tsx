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
import { Edit, Camera, Briefcase, Phone, Mail, Award, MapPin, Calendar, User } from "lucide-react";

const STATIC_BASE_URL = "http://localhost:8004";

/* ── Labeled Input ── */
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

/* ── Info Row ── */
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

/* ── Profile Image ── */
interface DoctorProfile extends DoctorProfileUpdateDto {
  doctorProfileId: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  country?: string;
  status?: string;
  profileImgUrl?: string;
}

const ProfileImage = ({ profileImgUrl, previewImage, firstLetter, onFileChange, uploading, imageKey }: any) => {
  const fullImageUrl = profileImgUrl ? `${STATIC_BASE_URL}${profileImgUrl}` : null;

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

/* ── Main Page ── */
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
    setFormData({ ...formData, [name]: name === "yearsOfExperience" ? Number(value) : value });
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
    await updateDoctorProfile(formData);
    setProfile((p) => p ? { ...p, ...formData } : p);
    setIsEditing(false);
    window.location.reload();
  };

  if (!profile) return <p className="text-center mt-20 text-gray-500">Loading…</p>;

  const firstLetter = profile.fullName?.charAt(0) || "?";

  const formattedDob = profile.dateOfBirth
    ? new Date(profile.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br text-black">
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
            {/* Name + Status */}
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

            {/* Key stats */}
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

            {/* Contact */}
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

      {/* Details Card */}
      <div className="max-w-6xl mx-auto px-10 pb-16">
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Doctor Details</h2>
          <InfoRow icon={<Mail className="w-4 h-4" />}     label="Email"              value={profile.email} />
          <InfoRow icon={<Phone className="w-4 h-4" />}    label="Contact"            value={profile.contactNumber} />
          <InfoRow icon={<Award className="w-4 h-4" />}    label="Specialization"     value={profile.specialization} />
          <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Working At"        value={profile.workingAT} />
          <InfoRow icon={<Award className="w-4 h-4" />}    label="Experience"         value={profile.yearsOfExperience ? `${profile.yearsOfExperience} years` : null} />
          <InfoRow icon={<User className="w-4 h-4" />}     label="Gender"             value={profile.gender ? profile.gender.charAt(0) + profile.gender.slice(1).toLowerCase() : null} />
          <InfoRow icon={<Calendar className="w-4 h-4" />} label="Date of Birth"      value={formattedDob} />
          <InfoRow icon={<MapPin className="w-4 h-4" />}   label="Country"            value={profile.country} />
        </div>
      </div>

      {/* Edit Modal */}
      <Transition appear show={isEditing} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsEditing}>
          <div className="fixed inset-0 bg-black/50" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 text-gray-900">
              <Dialog.Title className="text-lg font-semibold mb-4">Edit Profile</Dialog.Title>
              <div className="space-y-3">
                <LabeledInput label="Full Name"           name="fullName"           value={formData.fullName}           onChange={handleChange} />
                <LabeledInput label="Specialization"      name="specialization"     value={formData.specialization}     onChange={handleChange} />
                <LabeledInput label="Years of Experience" name="yearsOfExperience"  type="number" value={formData.yearsOfExperience} onChange={handleChange} />
                <LabeledInput label="Working At"          name="workingAT"          value={formData.workingAT}          onChange={handleChange} />
                <LabeledInput label="Contact Number"      name="contactNumber"      value={formData.contactNumber}      onChange={handleChange} />
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