"use client"; // Make this a client component since we use useState and useEffect

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Clock, Search, Users } from "lucide-react";
import { getDoctorAppointmentRequests, updateAppointmentRequestStatus } from "@/lib/api/doctorDashboard";
import { AppointmentRequest } from "@/lib/type/doctorDashboard";

export default function AppointmentRequestPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await getDoctorAppointmentRequests();
      setAppointments(data);
    } catch (error) {
      toast.error("Failed to fetch appointments");
    }
  };

const handleStatusUpdate = async (
  id: number,
  status: "APPROVED" | "REJECTED"
) => {
  console.log("🔵 handleStatusUpdate called with:", { id, status });

  try {
    console.log("⏳ Sending request to updateAppointmentRequestStatus...");
    const response = await updateAppointmentRequestStatus(id, status);

    setAppointments((prev) => {
      console.log("📌 Previous appointments:", prev);

      const updated = prev.map((apt) => {
        if (apt.requestId === id) {
          console.log("🟢 Matching appointment found:", apt);
          return { ...apt, status };
        }
        return apt;
      });

      console.log("🆕 Updated appointments:", updated);
      return updated;
    });

    toast.success(`Appointment ${status.toLowerCase()}`);
  } catch (error) {
    console.error("❌ Error updating appointment:", error);
    toast.error("Failed to update status");
  }
};

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesStatus =
      filterStatus === "all" || apt.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "status-approved";
      case "REJECTED":
        return "status-declined";
      default:
        return "status-pending";
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="medical-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search patients or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 medical-input"
              />
            </div>

            <div className="flex gap-2">
              {["all", "PENDING", "ACCEPTED", "REJECTED"].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status === "all" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Requests */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Appointment Requests</span>
            <Badge className="status-pending">
              {appointments.filter((apt) => apt.status === "PENDING").length} Pending
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment.requestId}
              className="p-4 rounded-lg border border-border hover:shadow-[var(--shadow-card)] transition-[var(--transition-smooth)]"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-card-foreground">{appointment.patientName}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {appointment.day} at {appointment.startTime}
                        </span>
                      </div>
                      <Badge className={getStatusBadge(appointment.status)}>
                        {appointment.status.toLowerCase()}
                      </Badge>
                    </div>
                    {appointment.notes && <p className="text-sm mt-2">{appointment.notes}</p>}
                  </div>
                </div>

                {appointment.status === "PENDING" && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(appointment.requestId, "APPROVED")}
                      className="success-button"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleStatusUpdate(appointment.requestId, "REJECTED")}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredAppointments.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No appointment requests found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
