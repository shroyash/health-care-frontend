"use client";

import dynamic from "next/dynamic";

import { DashboardStats } from "./_components/DashboardStatus";
import { AppointmentsList } from "./_components/Appointments";

// Load charts as CLIENT ONLY
const DashboardCharts = dynamic(
  () => import("./_components/DashboardCharts"),
  { ssr: false }
);

export default function AdminDashboardPage() {
  return (
    <div>
      <DashboardStats />
      <DashboardCharts />   
      <AppointmentsList />
    </div>
  );
}
