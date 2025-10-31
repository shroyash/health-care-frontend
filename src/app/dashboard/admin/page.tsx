import React from "react";
import { DashboardStats } from "./_components/DashboardStatus";
import { AppointmentsList } from "./_components/Appointments";

export default function page() {
  return (
    <div>
      <DashboardStats />
      <AppointmentsList />
    </div>
  );
}
