"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Search, User, ArrowLeft, Award } from "lucide-react";
import {
  getAllDoctors,
  getPendingDoctorCount,
  suspendDoctor,
  restoreDoctor,
} from "@/lib/api/adminDashboard";
import { useDashboardStats } from "@/context/DashboardStatsContext";
import { DoctorProfile } from "@/lib/type/adminDashboard";

/* ------------------ Helpers ------------------ */

const displayValue = (value: any, fallback = "Not provided") => {
  if (value === null || value === undefined || value === "") return fallback;
  return value;
};

// Status Badge Color
const getStatusColor = (status: DoctorProfile["status"]) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-700 border-green-200";
    case "INACTIVE":
      return "bg-gray-100 text-gray-600 border-gray-200";
    default:
      return "bg-muted text-muted-foreground";
  }
};

/* ------------------ Component ------------------ */

export default function DoctorManagementPage() {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] =
    useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const { statsData } = useDashboardStats();

  /* ------------------ Fetch Doctors ------------------ */

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const [allDoctors, pending] = await Promise.all([
          getAllDoctors(),
          getPendingDoctorCount(),
        ]);
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

  /* ------------------ Search Filter ------------------ */

  const filteredDoctors = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return doctors.filter(
      (d) =>
        d.fullName.toLowerCase().includes(term) ||
        d.email.toLowerCase().includes(term) ||
        (d.specialization ?? "").toLowerCase().includes(term)
    );
  }, [searchTerm, doctors]);

  /* ------------------ Suspend / Restore ------------------ */

  const handleStatusChange = async (doctor: DoctorProfile) => {
    try {
      if (doctor.status === "ACTIVE") {
        await suspendDoctor(doctor.doctorProfileId);
      } else {
        await restoreDoctor(doctor.doctorProfileId);
      }

      const updated = await getAllDoctors();
      setDoctors(updated);

      if (selectedDoctor) {
        const match = updated.find(
          (d) => d.doctorProfileId === selectedDoctor.doctorProfileId
        );
        setSelectedDoctor(match || null);
      }
    } catch (err) {
      console.error("Failed updating doctor status", err);
    }
  };

  /* ------------------ Loading ------------------ */

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

  /* ------------------ UI ------------------ */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Doctor Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage healthcare professionals
        </p>
      </div>

      {/* Stats */}
      {!selectedDoctor && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">
                {statsData.totalDoctors}
              </div>
              <p className="text-sm text-muted-foreground">Active Doctors</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {pendingCount}
              </div>
              <p className="text-sm text-muted-foreground">
                Pending Approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">
                {new Set(doctors.map((d) => d.specialization)).size}
              </div>
              <p className="text-sm text-muted-foreground">Specialties</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Doctor Details */}
      {selectedDoctor ? (
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Doctor Profile</CardTitle>
              <CardDescription>Complete details</CardDescription>
            </div>
            <Button variant="ghost" onClick={() => setSelectedDoctor(null)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {selectedDoctor.profileImgUrl ? (
                  <img
                    src={selectedDoctor.profileImgUrl}
                    alt={selectedDoctor.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-muted-foreground" />
                )}
              </div>

              <div>
                <h2 className="text-2xl font-semibold">
                  {selectedDoctor.fullName}
                </h2>
                <p className="text-muted-foreground">
                  {displayValue(selectedDoctor.specialization)}
                </p>
                <Badge className={`mt-2 ${getStatusColor(selectedDoctor.status)}`}>
                  {selectedDoctor.status}
                </Badge>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <ProfileField label="Email" value={selectedDoctor.email} />
              <ProfileField
                label="Phone"
                value={selectedDoctor.contactNumber}
              />
              <ProfileField
                label="Specialization"
                value={selectedDoctor.specialization}
              />
              <ProfileField
                label="Working At"
                value={selectedDoctor.workingAT}
              />
              <ProfileField
                label="Experience"
                value={
                  selectedDoctor.yearsOfExperience
                    ? `${selectedDoctor.yearsOfExperience} years`
                    : "Not provided"
                }
              />
              <ProfileField label="Gender" value={selectedDoctor.gender} />
              <ProfileField label="Country" value={selectedDoctor.country} />
              <ProfileField
                label="Date of Birth"
                value={
                  selectedDoctor.dateOfBirth
                    ? new Date(
                        selectedDoctor.dateOfBirth
                      ).toLocaleDateString()
                    : "Not provided"
                }
              />
            </div>

            <Button
              className={
                selectedDoctor.status === "ACTIVE"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-600 hover:bg-green-700"
              }
              onClick={() => handleStatusChange(selectedDoctor)}
            >
              {selectedDoctor.status === "ACTIVE"
                ? "Suspend Doctor"
                : "Restore Doctor"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Search Doctors</CardTitle>
            </CardHeader>
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
              <CardDescription>
                Complete list of registered doctors
              </CardDescription>
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
                        <h4 className="font-semibold text-lg">
                          {d.fullName}
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          {d.email}
                        </p>
                        <p className="text-sm">
                          {displayValue(d.specialization)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(d.status)}>
                        {d.status}
                      </Badge>
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

/* ------------------ Reusable Field ------------------ */

function ProfileField({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{displayValue(value)}</p>
    </div>
  );
}
