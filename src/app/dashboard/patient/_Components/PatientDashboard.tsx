"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  getUpcomingAppointments,
  getPatientDashboardStats,
  getPatientWeeklyCount,
  getPatientStatusCount,
} from "@/lib/api/patientDashboard";

import type {
  PatientAppointment,
  PatientDashboardStats,
  DailyAppointmentCount,
  AppointmentStatusCount,
} from "@/lib/type/patientDashboard";

interface StatusChartData {
  [key: string]: string | number;
  name: string;
  value: number;
}

const STATUS_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export function PatientDashboard() {
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [stats, setStats] = useState<PatientDashboardStats | null>(null);
  const [weeklyData, setWeeklyData] = useState<DailyAppointmentCount[]>([]);
  const [statusData, setStatusData] = useState<StatusChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [upcoming, statsData, weeklyCount, statusCount] = await Promise.all([
          getUpcomingAppointments(),
          getPatientDashboardStats(),
          getPatientWeeklyCount(),
          getPatientStatusCount(),
        ]);

        setAppointments(upcoming);
        setStats(statsData);
        setWeeklyData(weeklyCount);

        setStatusData(
          statusCount.map((item: AppointmentStatusCount) => ({
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

  const getStatusBadge = (status: PatientAppointment["status"]) => {
    const map: any = {
      CONFIRMED: "bg-green-500 text-white",
      PENDING: "bg-yellow-500 text-white",
      CANCELLED: "bg-red-500 text-white",
    };
    return <Badge className={map[status]}>{status}</Badge>;
  };

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
        <StatCard icon={FileText} label="Reports" value={stats?.totalReportWritten ?? 0} />
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

      {/* Upcoming Appointments */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : appointments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No upcoming appointments</p>
          ) : (
            appointments.map((a) => (
              <div key={a.appointmentId} className="flex justify-between p-4 rounded-lg bg-gray-100">
                <div>
                  <p className="font-medium">{a.doctorName}</p>
                  <p className="text-sm text-muted-foreground">{a.checkupType}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {a.appointmentDate} | {a.startTime} - {a.endTime}
                  </div>
                </div>
                {getStatusBadge(a.status)}
              </div>
            ))
          )}
        </CardContent>
      </Card>
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