"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { getAdminDashboardStats } from "@/lib/api/adminDashboard";
import type { AdminDashboardStats } from "@/lib/type/adminDashboard";

interface DashboardStatsContextType {
  statsData: AdminDashboardStats;
  fetchStats: () => Promise<void>;
}

const DashboardStatsContext = createContext<DashboardStatsContextType | undefined>(undefined);

export const DashboardStatsProvider = ({ children }: { children: ReactNode }) => {
  const [statsData, setStatsData] = useState<AdminDashboardStats>({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointmentsToday: 0,
    pendingDoctorApprovals: 0,
  });

  const fetchStats = async () => {
    try {
      const res = await getAdminDashboardStats();
      setStatsData(res);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  return (
    <DashboardStatsContext.Provider value={{ statsData, fetchStats }}>
      {children}
    </DashboardStatsContext.Provider>
  );
};

export const useDashboardStats = () => {
  const context = useContext(DashboardStatsContext);
  if (!context) throw new Error("useDashboardStats must be used within a DashboardStatsProvider");
  return context;
};
