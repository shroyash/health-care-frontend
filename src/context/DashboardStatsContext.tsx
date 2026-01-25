"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { getAdminDashboardStats } from "@/lib/api/adminDashboard";
import type { AdminDashboardStats } from "@/lib/type/adminDashboard";

interface DashboardStatsContextType {
  statsData: AdminDashboardStats;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

const DashboardStatsContext =
  createContext<DashboardStatsContextType | undefined>(undefined);

export const DashboardStatsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [statsData, setStatsData] = useState<AdminDashboardStats>({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointmentsToday: 0,
    pendingDoctorApprovals: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminDashboardStats();
      setStatsData(res);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load dashboard stats";
      setError(message);
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <DashboardStatsContext.Provider
      value={{ statsData, loading, error, fetchStats }}
    >
      {children}
    </DashboardStatsContext.Provider>
  );
};

export const useDashboardStats = () => {
  const context = useContext(DashboardStatsContext);
  if (!context) {
    throw new Error(
      "useDashboardStats must be used within a DashboardStatsProvider"
    );
  }
  return context;
};
