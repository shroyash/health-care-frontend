"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, User, ArrowLeft, Phone, Mail, Award, MapPin } from "lucide-react";
import {
  getAllDoctors,
  getPendingDoctorCount,
  suspendDoctor,
  restoreDoctor,
} from "@/lib/api/adminDashboard";
import { DoctorProfile as Doctor } from "@/lib/type/adminDashboard";
import { useDashboardStats } from "@/context/DashboardStatsContext";

// Status Badge Color
const getStatusColor = (status: Doctor["status"]) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "inactive":
      return "bg-gray-100 text-gray-600 border-gray-200";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function DoctorManagementPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  const { statsData } = useDashboardStats();

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const [allDoctors, pending] = await Promise.all([
          getAllDoctors(),
          getPendingDoctorCount(),
        ]);
        console.log(allDoctors);
        setDoctors(allDoctors);
        setPendingCount(pending);
      } catch (err) {
        console.error("Failed loading doctor data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Search filter
  const filteredDoctors = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return doctors.filter(
      (d) =>
        d.fullName.toLowerCase().includes(term) ||
        d.email.toLowerCase().includes(term) ||
        d.specialization.toLowerCase().includes(term)
    );
  }, [searchTerm, doctors]);

  // Suspend / Restore doctor
  const handleStatusChange = async (doctor: Doctor) => {
    try {
      if (doctor.status === "ACTIVE") {
        await suspendDoctor(doctor.doctorProfileId);
      } else {
        await restoreDoctor(doctor.doctorProfileId);
      }

      // Refresh doctor list
      const updated = await getAllDoctors();
      setDoctors(updated);

      if (selectedDoctor) {
        const match = updated.find((d) => d.doctorProfileId === selectedDoctor.doctorProfileId);
        setSelectedDoctor(match || null);
      }
    } catch (err) {
      console.error("Failed updating doctor status", err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Doctor Management</h1>
        <p className="text-muted-foreground mt-1">Manage healthcare professionals</p>
      </div>

      {/* Stats (only in list view) */}
      {!selectedDoctor && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{statsData.totalDoctors}</div>
            <p className="text-sm text-muted-foreground">Active Doctors</p>
          </CardContent></Card>

          <Card><CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-sm text-muted-foreground">Pending Approval</p>
          </CardContent></Card>

          <Card><CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {new Set(doctors.map((d) => d.specialization)).size}
            </div>
            <p className="text-sm text-muted-foreground">Specialties</p>
          </CardContent></Card>
        </div>
      )}

      {/* Doctor Details */}
      {selectedDoctor ? (
        <Card className="shadow-soft">
          <CardHeader className="flex justify-between items-center">
            <div>
              <CardTitle>Doctor Details</CardTitle>
              <CardDescription>Profile overview</CardDescription>
            </div>

            <Button variant="ghost" onClick={() => setSelectedDoctor(null)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Award className="h-6 w-6 text-primary" />
              </div>

              <div>
                <h2 className="text-xl font-semibold">{selectedDoctor.fullName}</h2>
                <p className="text-muted-foreground">{selectedDoctor.specialization}</p>

                <Badge className={`mt-2 ${getStatusColor(selectedDoctor.status)}`}>
                  {selectedDoctor.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <p><strong>Email:</strong> {selectedDoctor.email}</p>
              <p><strong>Phone:</strong> {selectedDoctor.contactNumber}</p>
              <p><strong>Working At:</strong> {selectedDoctor.workingAT}</p>
              <p><strong>Experience:</strong> {selectedDoctor.yearsOfExperience || "N/A"}</p>
            </div>

            <Button
              className={
                selectedDoctor.status === "ACTIVE"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-600 hover:bg-green-700"
              }
              onClick={() => handleStatusChange(selectedDoctor)}
            >
              {selectedDoctor.status === "ACTIVE" ? "Suspend Doctor" : "Restore Doctor"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search */}
          <Card>
            <CardHeader><CardTitle>Search Doctors</CardTitle></CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or specialization..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Doctor List */}
          <Card>
            <CardHeader>
              <CardTitle>All Doctors ({filteredDoctors.length})</CardTitle>
              <CardDescription>Complete list of registered doctors</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {filteredDoctors.map((d) => (
                  <div
                    key={d.doctorProfileId}
                    className="p-4 border rounded-lg hover:bg-accent/30 transition flex justify-between items-center"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>

                      <div>
                        <h4 className="font-semibold text-lg">{d.fullName}</h4>
                        <p className="text-muted-foreground text-sm">{d.email}</p>
                        <p className="text-sm">{d.specialization}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(d.status)}>{d.status}</Badge>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDoctor(d)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
