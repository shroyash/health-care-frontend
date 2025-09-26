"use client"; // MUST be the first line

import { DashboardStats } from "./_components/DashboardStatus";
import { AdminLayout } from "./_components/LayoutAdmin";

export default function DashboardPage() {
  return (
    <AdminLayout>
      <DashboardStats />
    </AdminLayout>
  );
}
