"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getAdminDashboardStats } from "@/lib/api/adminDashboard";
import type { AdminDashboardStats } from "@/lib/type/adminDashboard";



// Define context type
interface DashboardStatsContextType {
  statsData: AdminDashboardStats;
  setStatsData: React.Dispatch<React.SetStateAction<AdminDashboardStats>>;
}

// Create context
const DashboardStatsContext = createContext<DashboardStatsContextType | undefined>(undefined);

// Provider component
export const DashboardStatsProvider = ({ children }: { children: ReactNode }) => {
  const [statsData, setStatsData] = useState<AdminDashboardStats>({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointmentsToday: 0,
    pendingDoctorApprovals: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await getAdminDashboardStats();
        setStatsData(res);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    }

    fetchStats();
  }, []);

  return (
    <DashboardStatsContext.Provider value={{ statsData, setStatsData }}>
      {children}
    </DashboardStatsContext.Provider>
  );
};

// Custom hook
export const useDashboardStats = () => {
  const context = useContext(DashboardStatsContext);
  if (!context) {
    throw new Error("useDashboardStats must be used within a DashboardStatsProvider");
  }
  return context;
};
