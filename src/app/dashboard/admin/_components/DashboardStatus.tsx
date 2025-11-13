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
          console.log("✅ Pending doctor count fetched:", count);
          setLoadingPending(false);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch pending approvals";
        console.error("Failed to fetch pending doctor count:", err);
        if (isMounted) {
          setError(errorMessage);
          setPendingDoctorApprovals(0);
          setLoadingPending(false);  
        }
      }
    };

    fetchPending();
    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats: StatType[] = useMemo(
    () => [
      {
        title: "Total Patients",
        value: (statsData.totalPatients ?? 0).toString(),
        change: "+0.5%",
        changeType: "positive",
        icon: Users,
        gradient: "bg-gradient-primary",
      },
      {
        title: "Active Doctors",
        value: (statsData.totalDoctors ?? 0).toString(),
        change: "+0.5%",
        changeType: "positive",
        icon: UserCheck,
        gradient: "bg-gradient-success",
      },
      {
        title: "Today's Appointments",
        value: (statsData.totalAppointmentsToday ?? 0).toString(),
        change: "+0.1%",
        changeType: "positive",
        icon: Calendar,
        gradient: "bg-gradient-card",
      },
      {
        title: "Pending Doctor Approvals",
        value: loadingPending ? "..." : pendingDoctorApprovals.toString(),
        change: "0.4%",
        changeType: "negative",
        icon: TrendingUp,
        gradient: "bg-gradient-primary",
        isLoading: loadingPending,
      },
    ],
    [statsData, pendingDoctorApprovals, loadingPending]
  );

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
          const changeColor =
            stat.changeType === "positive" ? "text-green-500" : "text-red-500";

          return (
            <Card
              key={stat.title}
              className={`relative overflow-hidden border-0 shadow-soft hover:shadow-medium transition-all duration-300 ${
                stat.isLoading ? "opacity-60" : ""
              }`}
            >
              <div className={`absolute inset-0 opacity-5 ${stat.gradient}`} />
              <CardHeader className="relative flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.gradient} shadow-soft`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>

              <CardContent className="relative">
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-xs font-medium ${changeColor}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}