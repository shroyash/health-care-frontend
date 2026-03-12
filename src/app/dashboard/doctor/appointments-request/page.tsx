"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Clock, Search, Users, Info } from "lucide-react";
import {
  getDoctorAppointmentRequests,
  updateAppointmentRequestStatus,
} from "@/lib/api/doctorDashboard";
import { AppointmentRequest } from "@/lib/type/doctorDashboard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const formatFullDateFromBackend = (dateStr: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatTimeFromBackend = (timeStr: string): string => {
  if (!timeStr) return "";
  const [hour, minute] = timeStr.split(":").map(Number);
  if (isNaN(hour) || isNaN(minute)) return timeStr;
  const ampm = hour >= 12 ? "PM" : "AM";
  const hr = hour % 12 || 12;
  return `${hr}:${minute.toString().padStart(2, "0")} ${ampm}`;
};

export default function AppointmentRequestPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRequest | null>(null);

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

  const handleStatusUpdate = async (id: number, status: "APPROVED" | "REJECTED") => {
    try {
      await updateAppointmentRequestStatus(id, status);
      setAppointments((prev) =>
        prev.map((apt) => (apt.requestId === id ? { ...apt, status } : apt))
      );
      toast.success(`Appointment ${status.toLowerCase()}`);
    } catch (error) {
      console.error("Error updating appointment:", error);
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
        return "bg-green-100 text-green-700 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
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
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {["all", "PENDING", "APPROVED", "REJECTED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                    filterStatus === status
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                  }`}
                >
                  {status === "all" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
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
            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
              {appointments.filter((apt) => apt.status === "PENDING").length} Pending
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment.requestId}
              className="p-4 rounded-lg border border-border hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-card-foreground">{appointment.patientName}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {formatFullDateFromBackend(appointment.date)} |{" "}
                          {formatTimeFromBackend(appointment.startTime)} -{" "}
                          {formatTimeFromBackend(appointment.endTime)}
                        </span>
                      </div>
                      <Badge className={getStatusBadge(appointment.status)}>
                        {appointment.status.toLowerCase()}
                      </Badge>
                    </div>
                    {appointment.notes && (
                      <p className="text-sm mt-2">{appointment.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  {appointment.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(appointment.requestId, "APPROVED")}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-500 hover:bg-green-600 text-white transition-all duration-200"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(appointment.requestId, "REJECTED")}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
                      >
                        <XCircle className="w-4 h-4" />
                        Decline
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedAppointment(appointment)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                  >
                    <Info className="w-4 h-4" /> View Details
                  </button>
                </div>
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

      {/* Modal */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-2 text-sm">
              <p><strong>Patient Name:</strong> {selectedAppointment.patientName}</p>
              <p><strong>Date:</strong> {formatFullDateFromBackend(selectedAppointment.date)}</p>
              <p><strong>Start Time:</strong> {formatTimeFromBackend(selectedAppointment.startTime)}</p>
              <p><strong>End Time:</strong> {formatTimeFromBackend(selectedAppointment.endTime)}</p>
              <p>
                <strong>Status:</strong>{" "}
                <Badge className={`ml-1 ${getStatusBadge(selectedAppointment.status)}`}>
                  {selectedAppointment.status.toLowerCase()}
                </Badge>
              </p>
              {selectedAppointment.notes && (
                <p><strong>Notes:</strong> {selectedAppointment.notes}</p>
              )}
            </div>
          )}
          <DialogFooter className="mt-4">
            <button
              onClick={() => setSelectedAppointment(null)}
              className="w-full py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}