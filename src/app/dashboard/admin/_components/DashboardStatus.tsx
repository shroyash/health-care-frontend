"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Calendar, TrendingUp, AlertCircle } from "lucide-react";
import { useDashboardStats } from "@/context/DashboardStatsContext";
import { getPendingDoctorCount } from "@/lib/api/adminDashboard";

type StatType = {
  title: string;
  value: string | number;
  change: string;
  changeType: "positive" | "negative";
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  isLoading?: boolean;
};

export function DashboardStats() {
  const { statsData } = useDashboardStats();
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
          console.log(count);
          setPendingDoctorApprovals(count);
          setLoadingPending(false);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch pending approvals";
        if (isMounted) {
          setError(errorMessage);
          setPendingDoctorApprovals(0);
          setLoadingPending(false);
        }
      }
    };

    fetchPending();

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
        value: loadingPending ? "..." : pendingDoctorApprovals,
        change: "0.4%",
        changeType: "negative",
        icon: TrendingUp,
        gradient: "bg-gradient-to-r from-yellow-400 to-yellow-600",
        isLoading: loadingPending,
      },
    ],
    [statsData, pendingDoctorApprovals, loadingPending]
  );

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Error Loading Data</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
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
                {/* Value and Change */}
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-foreground">
                    {stat.isLoading ? (
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
                    ) : (
                      stat.value
                    )}
                  </div>
                  {!stat.isLoading && (
                    <p
                      className={`text-xs font-medium ${
                        stat.changeType === "positive"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {stat.changeType === "positive" ? "↑" : "↓"} {stat.change}
                    </p>
                  )}
                </div>

                {/* Icon in circle */}
                <div
                  className={`p-3 rounded-full shadow-md ${stat.gradient} flex items-center justify-center`}
                >
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