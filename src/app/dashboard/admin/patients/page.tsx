"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
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
import { Search, User, ArrowLeft } from "lucide-react";
import { useDashboardStats } from "@/context/DashboardStatsContext";
import { adminPatientApi } from "@/lib/api/patient.api";
import { PatientProfileDTO } from "@/lib/type/patient.types";

/* ------------------ Helpers ------------------ */

const displayValue = (value: any, fallback = "Not provided") => {
  if (value === null || value === undefined || value === "") return fallback;
  return value;
};

const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return "bg-green-100 text-green-700 border-green-200";
    case "INACTIVE":
      return "bg-gray-100 text-gray-600 border-gray-200";
    default:
      return "bg-muted text-muted-foreground";
  }
};

/* ------------------ Component ------------------ */

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientProfileDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const { statsData } = useDashboardStats();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientsData = await adminPatientApi.getAll();
        console.log("Fetched patients:", patientsData);
        setPatients(patientsData);
      } catch (err) {
        console.error("Failed to fetch patients:", err);
        toast.error("Failed to load patients. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPatients = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return patients.filter(
      (p) =>
        p.fullName.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term)
    );
  }, [searchTerm, patients]);

  const handleStatusChange = async (patient: PatientProfileDTO) => {
    try {
      const wasActive = patient.status?.toUpperCase() === "ACTIVE";

      if (wasActive) {
        await adminPatientApi.suspend(patient.patientId, "Violation of terms of service");
      } else {
        await adminPatientApi.restore(patient.patientId);
      }

      const updated = await adminPatientApi.getAll();
      setPatients(updated);

      if (selectedPatient) {
        const match = updated.find(
          (p) => p.patientId === selectedPatient.patientId
        );
        setSelectedPatient(match || null);
      }

      toast.success(
        wasActive
          ? `${patient.fullName} suspended successfully`
          : `${patient.fullName} restored successfully`
      );
    } catch (err) {
      console.error("Failed updating patient status:", err);
      toast.error("Failed to update patient status. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Patient Management</h1>
        <p className="text-muted-foreground mt-1">Manage all registered patients</p>
      </div>

      {/* Stats */}
      {!selectedPatient && statsData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">
                {statsData.totalPatients ?? 0}
              </div>
              <p className="text-sm text-muted-foreground">Active Patients</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {patients.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Patients</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">
                {statsData.totalAppointmentsToday ?? 0}
              </div>
              <p className="text-sm text-muted-foreground">Today's Appointments</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Patient Detail View */}
      {selectedPatient ? (
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Patient Profile</CardTitle>
              <CardDescription>Complete details</CardDescription>
            </div>
            <Button variant="ghost" onClick={() => setSelectedPatient(null)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Avatar + Name */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {selectedPatient.profileImage ? (
                  <img
                    src={`http://localhost:8004${selectedPatient.profileImage}`}
                    alt={selectedPatient.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-muted-foreground" />
                )}
              </div>

              <div>
                <h2 className="text-2xl font-semibold">{selectedPatient.fullName}</h2>
                <p className="text-muted-foreground">{selectedPatient.email}</p>
                <Badge className={`mt-2 ${getStatusColor(selectedPatient.status)}`}>
                  {selectedPatient.status}
                </Badge>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <ProfileField label="Email" value={selectedPatient.email} />
              <ProfileField label="Phone" value={selectedPatient.contactNumber} />
              <ProfileField label="Gender" value={selectedPatient.gender} />
              <ProfileField label="Country" value={selectedPatient.country} />
              <ProfileField
                label="Date of Birth"
                value={
                  selectedPatient.dateOfBirth
                    ? new Date(selectedPatient.dateOfBirth).toLocaleDateString()
                    : undefined
                }
              />
            </div>

            {/* Suspend / Restore */}
            <Button
              className={
                selectedPatient.status?.toUpperCase() === "ACTIVE"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-600 hover:bg-green-700"
              }
              onClick={() => handleStatusChange(selectedPatient)}
            >
              {selectedPatient.status?.toUpperCase() === "ACTIVE"
                ? "Suspend Patient"
                : "Restore Patient"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Search Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Patient List */}
          <Card>
            <CardHeader>
              <CardTitle>All Patients ({filteredPatients.length})</CardTitle>
              <CardDescription>Complete list of registered patients</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {filteredPatients.map((p) => (
                  <div
                    key={p.patientId}
                    className="p-4 border rounded-lg hover:bg-accent/30 transition flex justify-between items-center"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {p.profileImage ? (
                          <img
                            src={`http://localhost:8004${p.profileImage}`}
                            alt={p.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>

                      <div>
                        <h4 className="font-semibold text-lg">{p.fullName}</h4>
                        <p className="text-muted-foreground text-sm">{p.email}</p>
                        <p className="text-sm">{displayValue(p.contactNumber)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(p.status)}>
                        {p.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPatient(p)}
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

function ProfileField({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{displayValue(value)}</p>
    </div>
  );
}