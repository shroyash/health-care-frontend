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

import { getAppointments } from "@/lib/api/doctorDashboard";
import { DoctorAppointment } from "@/lib/type/doctorDashboard";

// ✅ "Sat, Mar 21, 2026"
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// ✅ "10:10 AM" from "10:10:00" or "10:10"
const formatTime = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
};

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

const STATUS_TABS = ["ALL", "SCHEDULED", "COMPLETED", "CANCELLED"];

interface DoctorAppointmentsListProps {
  upcoming?: boolean;
}

export default function DoctorAppointmentsList({ upcoming = true }: DoctorAppointmentsListProps) {
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [selected, setSelected] = useState<DoctorAppointment | null>(null);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const data = await getAppointments();
        setAppointments(data);
      } catch (error) {
        toast.error("Failed to fetch appointments");
      }
    }
    fetchAppointments();
  }, []);

  const today = new Date();

  const filteredAppointments = appointments
    .filter((a) => a.patientName.toLowerCase().includes(search.toLowerCase()))
    .filter((a) => (upcoming ? new Date(a.appointmentDate) >= today : true))
    .filter((a) => (upcoming ? a.status !== "CANCELLED" : true))
    .filter((a) => (!upcoming && activeTab !== "ALL" ? a.status === activeTab : true));

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
                  : "View all your appointments"}
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

          {/* Status Filter Tabs — only shown when upcoming is false */}
          {!upcoming && (
            <div className="flex gap-2 flex-wrap mt-2">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                  }`}
                >
                  {tab === "ALL" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment.appointmentId}
                className="bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition border border-gray-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-blue-50">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{appointment.patientName}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {appointment.checkupType.toLowerCase()} checkup
                      </p>
                    </div>
                  </div>
                  <Badge className={`capitalize ${getStatusColor(appointment.status)}`}>
                    {appointment.status.toLowerCase()}
                  </Badge>
                </div>

                {/* ✅ "Sat, Mar 21, 2026" */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(appointment.appointmentDate)}</span>
                </div>

                {/* ✅ "10:10 AM — 11:10 AM" */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(appointment.startTime)} — {formatTime(appointment.endTime)}</span>
                </div>

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
            <p className="text-center text-sm text-muted-foreground col-span-full py-10">
              No appointments found.
            </p>
          )}
        </CardContent>
      </Card>

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
              {/* ✅ "Sat, Mar 21, 2026" in modal too */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <strong>Date:</strong>
                <span className="ml-1">{formatDate(selected.appointmentDate)}</span>
              </div>
              {/* ✅ "10:10 AM — 11:10 AM" in modal too */}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <strong>Time:</strong>
                <span className="ml-1">{formatTime(selected.startTime)} — {formatTime(selected.endTime)}</span>
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