"use client";

import { useEffect, useState } from "react";
import { Search, Calendar, Clock, User, ExternalLink } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { getRecentAppointments } from "@/lib/api/adminDashboard";
import { AppointmentFull } from "@/lib/type/adminDashboard";

/* -------------------- Utils -------------------- */
const formatDateTime = (date: string) =>
  new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getStatusColor = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-700 border-green-200";
    case "SCHEDULED":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "COMPLETED":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "CANCELLED":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-muted text-muted-foreground";
  }
};

/* -------------------- Component -------------------- */
export function AppointmentsList() {
  const [appointments, setAppointments] = useState<AppointmentFull[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AppointmentFull | null>(null);

  useEffect(() => {
    async function fetchAppointments() {
      const data = await getRecentAppointments();
      setAppointments(data);
    }
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((a) =>
    `${a.patientName} ${a.doctorName}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      <Card className="border-0 shadow-lg rounded-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Recent Appointments
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                View and manage all appointments
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Search by patient or doctor..."
                className="pl-10 md:w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment.appointmentId}
                className="relative bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition-shadow border border-gray-100"
              >
                {/* Top info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-blue-50">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {appointment.patientName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Dr. {appointment.doctorName}
                      </p>
                    </div>
                  </div>

                  <Badge
                    className={`capitalize ${getStatusColor(appointment.status)}`}
                  >
                    {appointment.status.toLowerCase()}
                  </Badge>
                </div>

                {/* Appointment details */}
                <div className="flex flex-col gap-1 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDateTime(appointment.appointmentDate)}</span>
                  </div>
                  <div>
                    <strong>Checkup:</strong> {appointment.checkupType}
                  </div>
                </div>

                {/* View details button */}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelected(appointment)}
                >
                  View Details
                </Button>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-muted-foreground col-span-full">
              No appointments found.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ---------------- VIEW DETAILS MODAL ---------------- */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 text-sm">
              <div>
                <strong>Patient:</strong> {selected.patientName}
              </div>
              <div>
                <strong>Doctor:</strong> Dr. {selected.doctorName}
              </div>
              <div>
                <strong>Date & Time:</strong> {formatDateTime(selected.appointmentDate)}
              </div>
              <div>
                <strong>Checkup Type:</strong> {selected.checkupType}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <Badge className={`ml-2 ${getStatusColor(selected.status)}`}>
                  {selected.status}
                </Badge>
              </div>
              <div>
                <strong>Meeting Link:</strong>
                <a
                  href={selected.meetingLink}
                  target="_blank"
                  className="ml-2 text-blue-600 underline inline-flex items-center gap-1"
                >
                  Join Meeting <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}