"use client";

import { useEffect, useState } from "react";
import { Search, Clock, User, ExternalLink, Calendar } from "lucide-react";
import { toast } from "react-toastify";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { getUpcomingAppointments} from "@/lib/api/doctorDashboard";
import { DoctorAppointment } from "@/lib/type/doctorDashboard";

/* -------------------- Utils -------------------- */
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const getStatusColor = (status: string) => {
  switch (status) {
    case "SCHEDULED":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "COMPLETED":
      return "bg-green-100 text-green-700 border-green-200";
    case "CANCELLED":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-muted text-muted-foreground";
  }
};

interface DoctorAppointmentsListProps {
  upcoming?: boolean; // true = upcoming only, false = all
}

export default function DoctorAppointmentsList({ upcoming = true }: DoctorAppointmentsListProps) {
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<DoctorAppointment | null>(null);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        // Fetch all appointments
        const data = await getUpcomingAppointments(); // backend returns all
        setAppointments(data);
      } catch (error) {
        toast.error("Failed to fetch appointments");
      }
    }
    fetchAppointments();
  }, []);

  const today = new Date();

  const filteredAppointments = appointments
    .filter((a) =>
      a.patientName.toLowerCase().includes(search.toLowerCase())
    )
    .filter((a) => (upcoming ? new Date(a.appointmentDate) >= today : true));

  return (
    <>
      <Card className="border-0 shadow-lg rounded-xl mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">
                {upcoming ? "Upcoming Appointments" : "All Appointments"}
              </CardTitle>
              <CardDescription>
                {upcoming
                  ? "Manage your upcoming patient appointments"
                  : "View all appointments"}
              </CardDescription>
            </div>

            <div className="relative md:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment.appointmentId}
                className="bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition border border-gray-100"
              >
                {/* Top section */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-blue-50">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{appointment.patientName}</p>
                      <p className="text-xs text-muted-foreground">
                        Appointment
                      </p>
                    </div>
                  </div>

                  <Badge
                    className={`capitalize ${getStatusColor(appointment.status)}`}
                  >
                    {appointment.status.toLowerCase()}
                  </Badge>
                </div>

                {/* Start time */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Clock className="h-3 w-3" />
                  <span>{appointment.startTime}</span>
                </div>

                {/* View details */}
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

      {/* ---------------- DETAILS MODAL ---------------- */}
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
                <strong>Appointment Date:</strong> {formatDate(selected.appointmentDate)}
              </div>

              <div>
                <strong>Start Time:</strong> {selected.startTime}</div>

              <div>
                <strong>End Time:</strong> {selected.endTime}</div>

              <div>
                <strong>Checkup Type:</strong> {selected.checkupType}</div>

              <div>
                <strong>Status:</strong>
                <Badge className={`ml-2 ${getStatusColor(selected.status)}`}>
                  {selected.status}
                </Badge>
              </div>

              {selected.meetingLink && (
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
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
