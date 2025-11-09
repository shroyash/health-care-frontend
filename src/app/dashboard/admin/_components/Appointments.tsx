"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Clock, User } from "lucide-react";
import { getRecentAppointments } from "@/lib/api/adminDashboard";
import { useEffect, useState } from "react";
import { AppointmentFull } from "@/lib/type/adminDashboard";

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-success-light text-success border-success/20";
    case "in-progress":
      return "bg-primary-light text-primary border-primary/20";
    case "pending":
      return "bg-warning-light text-warning border-warning/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function AppointmentsList() {
  const [appointments, setAppointments] = useState<AppointmentFull[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const data = await getRecentAppointments();
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching recent appointments:", error);
      }
    }

    fetchAppointments();
  }, []);

  // Optional: filter logic for search
  const filteredAppointments = appointments.filter((appointment) =>
    appointment.patientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="shadow-soft border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-foreground">
              Recent Appointments
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage and monitor all appointments
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="hover:bg-accent">
            View All
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search appointments..."
            className="pl-10 bg-background border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary-light">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">
                      {appointment.patientName}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{appointment.appointmentTime}</span>
                      <Clock className="h-3 w-3 ml-2" />
                      <span>{appointment.appointmentTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {appointment.doctorName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {appointment.reason}
                    </p>
                  </div>
                  {/* <Badge className={`capitalize ${getStatusColor(appointment.status)}`}>
                    {appointment.}
                  </Badge> */}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              No appointments found.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
