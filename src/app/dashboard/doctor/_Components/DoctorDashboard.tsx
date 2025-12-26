"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, AlertTriangle, FileText, ArrowRight } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { dashboardStats, getUpcomingAppointments } from "@/lib/api/doctorDashboard";
import DoctorAppointmentsList from "./DoctorAppointmentsList";

interface DoctorDashboardStats {
  totalAppointmentsToday: number;
  pendingRequests: number;
  totalPatients: number;
  totalPatientsThisWeek: number;
  reportsThisMonth: number;
}

interface DoctorAppointment {
  appointmentId: number;
  patientId: number;
  patientName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  checkupType: string;
  meetingLink: string;
}

const COLORS = ["#3b82f6", "#facc15", "#10b981", "#ef4444"]; // pie chart colors

const DoctorDashboard = () => {
  const [statsData, setStatsData] = useState<DoctorDashboardStats | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<DoctorAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stats, upcoming] = await Promise.all([
          dashboardStats(),
          getUpcomingAppointments(),
        ]);
        setStatsData(stats);
        setUpcomingAppointments(upcoming);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = statsData
    ? [
        {
          title: "Pending Requests",
          value: statsData.pendingRequests.toString(),
          change: "3 urgent",
          icon: AlertTriangle,
          bgColor: "bg-yellow-400",
        },
        {
          title: "Total Patients",
          value: statsData.totalPatients.toLocaleString(),
          change: `+${statsData.totalPatientsThisWeek} this week`,
          icon: Users,
          bgColor: "bg-green-400",
        },
        {
          title: "Reports Written",
          value: statsData.reportsThisMonth.toString(),
          change: "This month",
          icon: FileText,
          bgColor: "bg-red-400",
        },
        {
          title: "Total Patient",
          value: statsData.totalPatients.toString(),
          change: "",
          icon: Users,
          bgColor: "bg-blue-400",
        },
      ]
    : [];

  const weeklyAppointments = Array.from({ length: 7 }).map((_, i) => ({
    name: `Day ${i + 1}`,
    appointments: Math.floor(Math.random() * 10) + 1,
  }));

  const checkupTypeData = [
    { name: "General", value: 10 },
    { name: "Dental", value: 5 },
    { name: "Eye", value: 7 },
    { name: "Specialist", value: 3 },
  ];



  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="border-0 shadow-sm h-32 p-4">
                  <div className="animate-pulse h-full bg-gray-200 rounded-lg"></div>
                </Card>
              ))
            : stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={index}
                    className="relative overflow-hidden border-0 shadow-soft hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="flex items-center justify-between gap-4 p-4">
                      {/* Text on left */}
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        {stat.change && <p className="text-sm text-gray-500">{stat.change}</p>}
                      </div>

                      {/* Icon on right */}
                      <div className={`p-3 rounded-full shadow ${stat.bgColor} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 mt-20">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl font-semibold">Weekly Appointments</CardTitle>
            </CardHeader>
            <CardContent className="w-full overflow-hidden">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={weeklyAppointments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="appointments"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl font-semibold">Patients by Checkup Type</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center w-full overflow-hidden">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={checkupTypeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    label
                  >
                    {checkupTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <DoctorAppointmentsList upcoming={true} />

 
      </div>
    </div>
  );
};

export default DoctorDashboard;
