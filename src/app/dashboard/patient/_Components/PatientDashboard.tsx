"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, PlusCircle, Users, FileText, Heart } from "lucide-react";


import {
  getUpcomingAppointments,
  getPatientDashboardStats,
} from "@/lib/api/patientDashboard";

import type {
  PatientAppointment,
  PatientDashboardStats,
} from "@/lib/type/patientDashboard";

export function PatientDashboard() {
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [stats, setStats] = useState<PatientDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);



  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

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

  const getStatusBadge = (status: PatientAppointment["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <Badge className="bg-success text-success-foreground">
            Confirmed
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-warning text-warning-foreground">Pending</Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-destructive text-destructive-foreground">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s your upcoming appointments
          </p>
        </div>
        <Button className="bg-gradient-primary shadow-soft hover:shadow-elevated transition-all duration-200">
          <PlusCircle className="h-4 w-4 mr-2" />
          Request Appointment
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Upcoming Appointments */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats?.totalUpcomingAppointments ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Doctors */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.totalActiveDoctor}</p>
                <p className="text-sm text-muted-foreground">Active Doctors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Status */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">Good</p>
                <p className="text-sm text-muted-foreground">Health Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading appointments...</p>
          ) : appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No upcoming appointments.
            </p>
          ) : (
            appointments.map((appointment) => (
              <div
                key={appointment.appointmentId}
                className="flex items-center justify-between p-4 bg-accent rounded-lg"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {appointment.doctorName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.checkupType}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {appointment.appointmentDate} |{" "}
                      {appointment.startTime} - {appointment.endTime}
                    </span>
                  </div>
                </div>
                {getStatusBadge(appointment.status)}
              </div>
            ))
          )}

          <Button variant="outline" className="w-full">
            View All Appointments
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
