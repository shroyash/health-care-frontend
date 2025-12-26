"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Calendar, TrendingUp } from "lucide-react";
import { useDashboardStats } from "@/context/DashboardStatsContext";
import { getPendingDoctorCount } from "@/lib/api/adminDashboard";

type StatType = {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  isLoading?: boolean;
};

export function DashboardStats() {
  const { statsData, fetchStats } = useDashboardStats();
  const [pendingDoctorApprovals, setPendingDoctorApprovals] = useState<number>(0);
  const [loadingPending, setLoadingPending] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPending = async () => {
      try {
        setLoadingPending(true);
        setError(null);
        const count = await getPendingDoctorCount();
        if (isMounted) {
          setPendingDoctorApprovals(count);
          setLoadingPending(false);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch pending approvals";
        if (isMounted) {
          setError(errorMessage);
          setPendingDoctorApprovals(0);
          setLoadingPending(false);  
        }
      }
    };

    fetchPending();
    fetchStats();

    return () => { isMounted = false; };
  }, []);

  const stats: StatType[] = useMemo(() => [
    {
      title: "Total Patients",
      value: (statsData.totalPatients ?? 0).toString(),
      change: "+0.5%",
      changeType: "positive",
      icon: Users,
      gradient: "bg-gradient-to-r from-blue-400 to-blue-600",
    },
    {
      title: "Active Doctors",
      value: (statsData.totalDoctors ?? 0).toString(),
      change: "+0.5%",
      changeType: "positive",
      icon: UserCheck,
      gradient: "bg-gradient-to-r from-green-400 to-green-600",
    },
    {
      title: "Today's Appointments",
      value: (statsData.totalAppointmentsToday ?? 0).toString(),
      change: "+0.1%",
      changeType: "positive",
      icon: Calendar,
      gradient: "bg-gradient-to-r from-purple-400 to-purple-600",
    },
    {
      title: "Pending Doctor Approvals",
      value: loadingPending ? "..." : pendingDoctorApprovals.toString(),
      change: "0.4%",
      changeType: "negative",
      icon: TrendingUp,
      gradient: "bg-gradient-to-r from-yellow-400 to-yellow-600",
      isLoading: loadingPending,
    },
  ], [statsData, pendingDoctorApprovals, loadingPending]);

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">⚠️ {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className={`relative overflow-hidden border-0 shadow-soft hover:shadow-lg transition-all duration-300 ${
                stat.isLoading ? "opacity-60" : ""
              }`}
            >
              <CardHeader className="relative flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="relative flex items-center justify-between">
                {/* Value */}
                <div className="text-2xl font-bold text-foreground flex items-center gap-2">
                  {stat.value}
                </div>

                {/* Icon in circle */}
                <div className={`p-3 rounded-full shadow ${stat.gradient} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
