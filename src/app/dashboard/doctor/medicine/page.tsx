"use client";

import React from "react";
import { useUserProfile } from "@/context/UserProfileContext";
import MedicinePage from "@/components/ui/MedicinePage";

export default function Page() {
  const { userProfile, loading } = useUserProfile();

  if (loading) return <p className="text-center mt-20 text-gray-500">Loading...</p>;

  return (
    <div>
      <MedicinePage
        role={"DOCTOR"}
        currentDoctorId={userProfile?.userId}
      />
    </div>
  );
}