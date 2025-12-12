"use client";

import React, { useEffect, useState, Fragment } from "react";
import { getDoctorProfile, updateDoctorProfile } from "@/lib/api/doctorProfileApi";
import type { DoctorProfileUpdateDto } from "@/lib/api/doctorProfileApi";
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

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<DoctorProfileUpdateDto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<DoctorProfileUpdateDto>({
    fullName: "",
    email: "",
    specialization: "",
    yearsOfExperience: 0,
    workingAT: "",
    contactNumber: "",
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getDoctorProfile();
        setProfile(data);
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
    setProfileImage(file);
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!profile) return;
    try {
      const updated = await updateDoctorProfile(formData);

      // Update state to immediately reflect changes
      if (updated) {
        setProfile(updated);
        setFormData(updated);
      } else {
        setProfile(formData); // fallback if API doesn't return updated profile
      }

      setIsEditing(false);

      if (profileImage) {
        console.log("Upload image file:", profileImage);
        // TODO: implement backend upload
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  if (!profile)
    return <p className="p-6 text-center text-gray-500">Loading profile...</p>;

  const firstLetter = profile.email.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-start">
      <div className="max-w-4xl w-full space-y-6">
        {/* Profile Card */}
        <div className="bg-white shadow-xl rounded-2xl p-6 relative">
          <div className="flex items-center space-x-6">
            {/* Profile Image */}
            <div className="relative">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border-4 border-blue-500"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gray-200 border-4 border-blue-500 flex items-center justify-center text-3xl font-bold text-gray-700">
                  {firstLetter}
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer border-2 border-white">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            {/* Profile Info */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
              <p className="text-gray-500 text-sm">{profile.specialization}</p>
              <p className="text-gray-400 text-sm mt-1">
                {profile.yearsOfExperience} years experience
              </p>
            </div>

            {/* Edit Button */}
            <div className="ml-auto">
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" /> <span>Edit</span>
              </Button>
            </div>
          </div>

          {/* Contact & Workplace */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p className="text-gray-900 font-medium">{profile.email}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Contact</p>
              <p className="text-gray-900 font-medium">{profile.contactNumber}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Working At</p>
              <p className="text-gray-900 font-medium">{profile.workingAT}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Specialization</p>
              <p className="text-gray-900 font-medium">{profile.specialization}</p>
            </div>
          </div>
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
                    {/* Image Upload */}
                    <div className="relative">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Profile"
                          className="w-28 h-28 rounded-full object-cover border-4 border-blue-500"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-gray-200 border-4 border-blue-500 flex items-center justify-center text-3xl font-bold text-gray-700">
                          {firstLetter}
                        </div>
                      )}
                      <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer border-2 border-white">
                        <Camera className="w-4 h-4 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>

                    {/* Editable Fields */}
                    <LabeledInput
                      label="Full Name"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                    <LabeledInput
                      label="Specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                    />
                    <LabeledInput
                      label="Years of Experience"
                      name="yearsOfExperience"
                      type="number"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                    />
                    <LabeledInput
                      label="Working At"
                      name="workingAT"
                      value={formData.workingAT}
                      onChange={handleChange}
                    />
                    <LabeledInput
                      label="Contact Number"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mt-6 flex justify-end space-x-2">
                    <Button onClick={handleSave}>Save</Button>
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
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
