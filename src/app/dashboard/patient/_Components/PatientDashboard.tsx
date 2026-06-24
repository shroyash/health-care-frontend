"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, FileText, Heart } from "lucide-react";

import { getPatientDashboardStats } from "@/lib/api/patientDashboard";
import { PatientDashboardStatsDto } from "@/lib/type/dashboard.types";

import PatientAppointmentsList from "./PatientAppointmentList";
import PatientDashboardCharts from "./Patientdashboardcharts";

export function PatientDashboard() {
  const [stats, setStats] = useState<PatientDashboardStatsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const statsData = await getPatientDashboardStats();
        if (isMounted) {
          setStats(statsData);
        }
      } catch (error) {
        console.error("Dashboard fetch error", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Overview of your healthcare activity</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="shadow-sm border-0 w-full h-[76px] animate-pulse bg-muted" />
          ))
        ) : (
          <>
            <StatCard icon={Calendar} label="Upcoming" value={stats?.totalUpcomingAppointments ?? 0} />
            <StatCard icon={Users} label="Doctors" value={stats?.totalActiveDoctor ?? 0} />
            <StatCard icon={FileText} label="Reports" value={stats?.totalReportsWritten ?? 0} />
            <StatCard icon={Heart} label="Health" value="Good" />
          </>
        )}
      </div>

      {/* Charts */}
      <PatientDashboardCharts />

      {/* Upcoming Appointments */}
      <PatientAppointmentsList upcoming={true} />
    </div>
  );
}

/* ---------- Stat Card ---------- */
function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <Card className="shadow-sm border-0 w-full">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}