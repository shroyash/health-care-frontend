"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, AlertTriangle, FileText, ArrowRight } from "lucide-react";

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

import { dashboardStats, getTodayAppointments } from "@/lib/api/doctorDashboard";

const DoctorDashboard = () => {
  const [statsData, setStatsData] = useState<DoctorDashboardStats | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<DoctorAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch data from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Call actual backend APIs using the API service
        const [stats, appointments] = await Promise.all([
          dashboardStats(),
          getTodayAppointments(),
        ]);

        setStatsData(stats);
        setTodayAppointments(appointments);
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
          title: "Today's Appointments",
          value: statsData.totalAppointmentsToday.toString(),
          change: "+2 from yesterday",
          icon: Clock,
          bgColor: "bg-blue-500",
        },
        {
          title: "Pending Requests",
          value: statsData.pendingRequests.toString(),
          change: "3 urgent",
          icon: AlertTriangle,
          bgColor: "bg-blue-500",
        },
        {
          title: "Total Patients",
          value: statsData.totalPatients.toLocaleString(),
          change: `+${statsData.totalPatientsThisWeek} this week`,
          icon: Users,
          bgColor: "bg-blue-500",
        },
        {
          title: "Reports Written",
          value: statsData.reportsThisMonth.toString(),
          change: "This month",
          icon: FileText,
          bgColor: "bg-blue-500",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            // Loading skeleton for stats
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                        <p className="text-sm text-gray-500">{stat.change}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Today's Appointments - Full Width */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-xl font-semibold">
              Today's Appointments
            </CardTitle>
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="animate-pulse p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No appointments for today.
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map((appt) => (
                  <div
                    key={appt.appointmentId}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {appt.patientName}
                        </p>
                        <p className="text-sm text-gray-600">{appt.checkupType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold text-gray-900">{appt.startTime}</p>
                      <Badge className="bg-blue-500 hover:bg-blue-600">
                        confirmed
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorDashboard;