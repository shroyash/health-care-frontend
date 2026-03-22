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
import { Edit, Camera, Phone, Mail, MapPin, Calendar, User } from "lucide-react";

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
const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-blue-500">{icon}</span>
      <span className="text-gray-500 font-medium w-28 shrink-0">{label}</span>
      <span className="text-gray-800">{value}</span>
    </div>
  );
};

/* ── Profile Image ── */
const ProfileImage = ({
  profileImgUrl,
  previewImage,
  firstLetter,
  onFileChange,
  uploading,
  imageKey,
}: any) => {
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
      <label
        className={`absolute bottom-2 right-2 rounded-full p-3 bg-blue-600 text-white shadow-lg transition ${
          uploading ? "opacity-50" : "cursor-pointer hover:bg-blue-700"
        }`}
      >
        <Camera className="w-5 h-5" />
        <input type="file" accept="image/*" className="hidden" onChange={onFileChange} disabled={uploading} />
      </label>
    </div>
  );
};

/* ── Main Page ── */
export default function PatientProfilePage() {
  const [profile, setProfile] = useState<PatientProfileDTO | null>(null);

  // ✅ All 4 fields matching PatientProfileUpdateDto
  const [form, setForm] = useState<PatientProfileUpdateDto>({
    fullname: "",
    contactNumber: "",
    country: "",
    dateOfBirth: "",
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageKey, setImageKey] = useState(0);

  useEffect(() => {
    getPatientProfile().then((data: any) => {
      setProfile(data);
      // ✅ Populate all fields from API response
      setForm({
        fullname: data.fullName ?? "",
        contactNumber: data.contactNumber ?? "",
        country: data.country ?? "",
        dateOfBirth: data.dateOfBirth ?? "",
      });
    });
  }, []);

  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploading(true);
    setPreviewImage(URL.createObjectURL(file));
    uploadPatientProfileImage(profile.patientId, file)
      .then((url) => {
        setProfile((p) => (p ? { ...p, profileImgUrl: url } : p));
        setImageKey((k) => k + 1);
        setPreviewImage(null);
      })
      .finally(() => setUploading(false));
  };

  const handleSave = async () => {
    if (!profile) return;
    await updatePatientProfile(form);
    // ✅ Update all fields locally
    setProfile((p) =>
      p
        ? {
            ...p,
            fullName: form.fullname,
            contactNumber: form.contactNumber,
            country: form.country,
            dateOfBirth: form.dateOfBirth,
          }
        : p
    );
    setIsEditing(false);
    window.location.reload();
  };

  if (!profile) return <p className="text-center mt-20 text-gray-500">Loading…</p>;

  const firstLetter = profile.fullName?.charAt(0) || "?";

  const formattedDob = profile.dateOfBirth
    ? new Date(profile.dateOfBirth).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
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
              <h1 className="text-4xl font-bold">{profile.fullName}</h1>
              {profile.status && (
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                    profile.status === "ACTIVE"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {profile.status}
                </span>
              )}
            </div>

            {/* Gender, DOB, Country */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-sm opacity-90">
              {profile.gender && (
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {profile.gender.charAt(0) + profile.gender.slice(1).toLowerCase()}
                </span>
              )}
              {formattedDob && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {formattedDob}
                </span>
              )}
              {profile.country && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {profile.country}
                </span>
              )}
            </div>

            {/* Contact */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex items-center gap-2 opacity-90">
                <Mail className="w-4 h-4" /> {profile.email}
              </div>
              <div className="flex items-center gap-2 opacity-90">
                <Phone className="w-4 h-4" /> {profile.contactNumber}
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

      {/* Details Card */}
      <div className="max-w-6xl mx-auto px-10 pb-16">
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Patient Details</h2>
          <InfoRow icon={<Mail className="w-4 h-4" />}     label="Email"         value={profile.email} />
          <InfoRow icon={<Phone className="w-4 h-4" />}    label="Contact"       value={profile.contactNumber} />
          <InfoRow icon={<User className="w-4 h-4" />}     label="Gender"        value={profile.gender ? profile.gender.charAt(0) + profile.gender.slice(1).toLowerCase() : null} />
          <InfoRow icon={<Calendar className="w-4 h-4" />} label="Date of Birth" value={formattedDob} />
          <InfoRow icon={<MapPin className="w-4 h-4" />}   label="Country"       value={profile.country} />
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
                <LabeledInput
                  label="Full Name"
                  value={form.fullname}
                  onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                />
                <LabeledInput
                  label="Contact Number"
                  value={form.contactNumber}
                  onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                />
                <LabeledInput
                  label="Country"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
                <LabeledInput
                  label="Date of Birth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button onClick={handleSave}>Save</Button>
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
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