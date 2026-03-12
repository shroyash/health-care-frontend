"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, AlertTriangle } from "lucide-react";
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

import {
  dashboardStats,
  getUpcomingAppointments,
  getDoctorWeeklyAppointmentCount,
  getCheckupTypeCount,
} from "@/lib/api/doctorDashboard";
import DoctorAppointmentsList from "./DoctorAppointmentsList";
import { DoctorDashboardStats, DoctorAppointment, CheckupTypeCountDto, DailyAppointmentCount } from "@/lib/type/doctorDashboard";

interface CheckupTypeChartData {
  [key: string]: string | number; // Required for Recharts Pie
  name: string;
  value: number;
}

const COLORS = ["#3b82f6", "#facc15", "#10b981", "#ef4444"];

const DoctorDashboard = () => {
  const [statsData, setStatsData] = useState<DoctorDashboardStats | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<DoctorAppointment[]>([]);
  const [weeklyAppointments, setWeeklyAppointments] = useState<DailyAppointmentCount[]>([]);
  const [checkupTypeData, setCheckupTypeData] = useState<CheckupTypeChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats
        const stats = await dashboardStats();
        setStatsData(stats);

        // Fetch upcoming appointments
        const upcoming = await getUpcomingAppointments();
        setUpcomingAppointments(upcoming);

        // Fetch weekly appointments and format for LineChart
        const weekly = await getDoctorWeeklyAppointmentCount();
        console.log("Weekly Appointments:", weekly);
        setWeeklyAppointments(
          weekly.map(item => ({
            date: item.date,
            count: item.count,
          }))
        );

        // Fetch checkup type counts and format for PieChart
        const checkups = await getCheckupTypeCount();
        console.log("Checkup Type Counts:", checkups);
        const formattedCheckups: CheckupTypeChartData[] = checkups.map(item => ({
          name: item.checkupType,
          value: item.count,
        }));
        setCheckupTypeData(formattedCheckups);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Dashboard stats cards
  const stats = statsData
    ? [
        { title: "Pending Requests", value: statsData.pendingRequests, icon: AlertTriangle, bgColor: "bg-yellow-400" },
        { title: "Reports Taken", value: statsData.reportsTaken, icon: Users, bgColor: "bg-green-400" },
        { title: "Total Patients", value: statsData.totalPatients, icon: Users, bgColor: "bg-red-400" },
        { title: "Today's Appointments", value: statsData.totalAppointmentsToday, icon: Clock, bgColor: "bg-blue-400" },
      ]
    : [];

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
                  <Card key={index} className="relative overflow-hidden border-0 shadow-soft hover:shadow-lg transition-all duration-300">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-full shadow ${stat.bgColor} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 mt-10">

          {/* Weekly Appointments Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Weekly Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={weeklyAppointments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Checkup Type Pie Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Patients by Checkup Type</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={checkupTypeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                  >
                    {checkupTypeData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>

        {/* Upcoming Appointments List */}
  <DoctorAppointmentsList upcoming={true} />

      </div>
    </div>
  );
};

export default DoctorDashboard;