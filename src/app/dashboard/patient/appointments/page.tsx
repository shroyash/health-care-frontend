"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";

import { getUpcomingAppointments } from "@/lib/api/patientDashboard";
import type { PatientAppointment } from "@/lib/type/patientDashboard";

export default function AppointmentPage() {
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = await getUpcomingAppointments();
        console.log(data);
        setAppointments(data);
      } catch (err) {
        console.error("Failed to fetch appointments", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const getStatusBadge = (status: PatientAppointment["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-success text-success-foreground">Confirmed</Badge>;
      case "PENDING":
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      case "CANCELLED":
        return <Badge className="bg-destructive text-destructive-foreground">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Upcoming Appointments</h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s a list of your upcoming appointments
        </p>
      </div>

      {/* Upcoming Appointments */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Appointments
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading appointments...</p>
          ) : appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
          ) : (
            appointments.map((appointment) => (
              <div
                key={appointment.appointmentId}
                className="flex items-center justify-between p-4 bg-accent rounded-lg"
              >
                <div>
                  <p className="font-medium text-foreground">{appointment.doctorName}</p>
                  <p className="text-sm text-muted-foreground">{appointment.checkupType}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {appointment.appointmentDate} | {appointment.startTime} - {appointment.endTime}
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
