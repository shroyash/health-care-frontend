"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  PlusCircle,
  Users,
  FileText,
  Heart,
} from "lucide-react";

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
} from "recharts";

import {
  getUpcomingAppointments,
  getPatientDashboardStats,
} from "@/lib/api/patientDashboard";

import type {
  PatientAppointment,
  PatientDashboardStats,
} from "@/lib/type/patientDashboard";

const STATUS_COLORS = {
  CONFIRMED: "#22c55e",
  PENDING: "#f59e0b",
  CANCELLED: "#ef4444",
};

export function PatientDashboard() {
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [stats, setStats] = useState<PatientDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentData, statsData] = await Promise.all([
          getUpcomingAppointments(),
          getPatientDashboardStats(),
        ]);
        setAppointments(appointmentData);
        setStats(statsData);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ---------- Chart Data ---------- */

  // Line chart (appointments by date)
  const appointmentsByDate = appointments.reduce((acc: any[], curr) => {
    const existing = acc.find((i) => i.date === curr.appointmentDate);
    if (existing) existing.count += 1;
    else acc.push({ date: curr.appointmentDate, count: 1 });
    return acc;
  }, []);

  // Pie chart (status breakdown)
  const statusData = ["CONFIRMED", "PENDING", "CANCELLED"].map((status) => ({
    name: status,
    value: appointments.filter((a) => a.status === status).length,
  }));

  const getStatusBadge = (status: PatientAppointment["status"]) => {
    const map: any = {
      CONFIRMED: "bg-success text-success-foreground",
      PENDING: "bg-warning text-warning-foreground",
      CANCELLED: "bg-destructive text-destructive-foreground",
    };
    return <Badge className={map[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your healthcare activity
          </p>
        </div>
        <Button className="bg-gradient-primary shadow-soft">
          <PlusCircle className="h-4 w-4 mr-2" />
          Request Appointment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="Upcoming" value={stats?.totalUpcomingAppointments ?? 0} />
        <StatCard icon={Users} label="Doctors" value={stats?.totalActiveDoctor ?? 0} />
        <StatCard icon={FileText} label="Reports" value={0} />
        <StatCard icon={Heart} label="Health" value="Good" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Appointments Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={appointmentsByDate}>
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Appointment Status</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : appointments.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No upcoming appointments
            </p>
          ) : (
            appointments.map((a) => (
              <div
                key={a.appointmentId}
                className="flex justify-between p-4 rounded-lg bg-accent"
              >
                <div>
                  <p className="font-medium">{a.doctorName}</p>
                  <p className="text-sm text-muted-foreground">
                    {a.checkupType}
                  </p>
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

/* ---------- Small Stat Card ---------- */

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: any;
}) {
  return (
    <Card className="bg-gradient-card shadow-card border-0">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
