"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, FileText, Heart } from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
  getPatientDashboardStats,
  getWeeklyAppointmentsByPatient,
  getPatientStatusCount,
} from "@/lib/api/patientDashboard";

import { PatientDashboardStatsDto, WeeklyAppointmentCountDto } from "@/lib/type/dashboard.types";
import { AppointmentStatusCountDto } from "@/lib/type/appointment.types";
import PatientAppointmentsList from "./PatientAppointmentList";

interface StatusChartData {
  [key: string]: string | number;
  name: string;
  value: number;
}

const STATUS_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export function PatientDashboard() {
  const [stats, setStats] = useState<PatientDashboardStatsDto | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyAppointmentCountDto[]>([]);
  const [statusData, setStatusData] = useState<StatusChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsData, weeklyCount, statusCount] = await Promise.all([
          getPatientDashboardStats(),
          getWeeklyAppointmentsByPatient(),
          getPatientStatusCount(),
        ]);

        setStats(statsData);
        setWeeklyData(weeklyCount);
        setStatusData(
          statusCount.map((item: AppointmentStatusCountDto) => ({
            name: item.status,
            value: item.count,
          }))
        );
      } catch (error) {
        console.error("Dashboard fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
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
        <StatCard icon={Calendar} label="Upcoming" value={stats?.totalUpcomingAppointments ?? 0} />
        <StatCard icon={Users} label="Doctors" value={stats?.totalActiveDoctor ?? 0} />
        <StatCard icon={FileText} label="Reports" value={stats?.totalReportsWritten ?? 0} />
        <StatCard icon={Heart} label="Health" value="Good" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Appointments Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-100">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Appointment Status</CardTitle>
          </CardHeader>
          <CardContent className="h-100 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  label
                >
                  {statusData.map((_, index) => (
                    <Cell key={index} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      
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