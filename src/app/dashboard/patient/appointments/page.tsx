"use client";

import { useEffect, useState } from "react";
import { Search, Clock, User, ExternalLink } from "lucide-react";
import { toast } from "react-toastify";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { getAppointments } from "@/lib/api/patientDashboard";
import { PatientAppointment } from "@/lib/type/patientDashboard";

/* -------------------- Utils -------------------- */
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const getStatusColor = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-700 border-green-200";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "CANCELLED":
      return "bg-red-100 text-red-700 border-red-200";
    case "SCHEDULED":
      return "bg-blue-100 text-blue-700 border-blue-200";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function PatientAppointmentsList() {
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PatientAppointment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        setLoading(true);
        const data = await getAppointments();

        // Map backend fields to frontend
        const mapped: PatientAppointment[] = data.map((a: any) => ({
          appointmentId: a.appointmentId || a.appointment_id,
          doctorId: a.doctorId || a.doctor_id,
          doctorName: a.doctorName || a.doctor_name,
          appointmentDate: a.appointmentDate || a.appointment_date,
          startTime: a.startTime || a.start_time,
          endTime: a.endTime || a.end_time,
          checkupType: a.checkupType || a.checkup_type,
          status: a.status,
          meetingLink: a.meetingLink || a.meeting_link,
        }));

        console.log("Mapped appointments:", mapped);
        setAppointments(mapped);
      } catch (error) {
        toast.error("Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, []);

  // Filter by search input
  const filteredAppointments = appointments.filter((a) =>
    a.doctorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Card className="border-0 shadow-lg rounded-xl mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">
                All Appointments
              </CardTitle>
              <CardDescription>
                Manage all your doctor appointments
              </CardDescription>
            </div>

            <div className="relative md:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctor..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="text-sm text-muted-foreground col-span-full">
              Loading appointments...
            </p>
          ) : filteredAppointments.length > 0 ? (
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
                      <p className="font-semibold">{appointment.doctorName}</p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.checkupType}
                      </p>
                    </div>
                  </div>

                  <Badge
                    className={`capitalize ${getStatusColor(appointment.status)}`}
                  >
                    {appointment.status.toLowerCase()}
                  </Badge>
                </div>

                {/* Appointment time */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDate(appointment.appointmentDate)} | {appointment.startTime} - {appointment.endTime}
                  </span>
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
                <strong>Doctor:</strong> {selected.doctorName}
              </div>

              <div>
                <strong>Appointment Date:</strong> {formatDate(selected.appointmentDate)}
              </div>

              <div>
                <strong>Start Time:</strong> {selected.startTime}
              </div>

              <div>
                <strong>End Time:</strong> {selected.endTime}
              </div>

              <div>
                <strong>Checkup Type:</strong> {selected.checkupType}
              </div>

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
