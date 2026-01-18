"use client";

import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, User, Eye, ArrowLeft } from "lucide-react";
import {
  getAllPatients,
  getPatientStats,
  suspendPatient,
  restorePatient,
} from "@/lib/api/adminDashboard";
import {
  PatientProfile as Patient,
  PatientStats as PatientDashboardStats,
} from "@/lib/type/adminDashboard";

// Helper for badge colors
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-700 border-green-200";
    case "inactive":
      return "bg-gray-100 text-gray-600 border-gray-200";
    default:
      return "bg-muted text-muted-foreground";
  }
};

// Convert gender string to display value
const displayGender = (gender?: string | null) => {
  if (!gender) return "N/A";
  switch (gender.toUpperCase()) {
    case "MALE":
      return "Male";
    case "FEMALE":
      return "Female";
    default:
      return gender;
  }
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<PatientDashboardStats>({
    activePatients: 0,
    totalPatients: 0,
    totalAppointments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Fetch patients + stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsData, statsData] = await Promise.all([
          getAllPatients(),
          getPatientStats(),
        ]);
        setPatients(patientsData);
        setStats(statsData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter patients by search
  const filteredPatients = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return patients.filter(
      (p) =>
        p.fullName.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term)
    );
  }, [patients, searchTerm]);

  // Handle Suspend / Restore
  const handleStatusChange = async (patientId: string, status: string) => {
    try {
      if (status.toLowerCase() === "active") {
        await suspendPatient(patientId);
      } else {
        await restorePatient(patientId);
      }
      const updatedPatients = await getAllPatients();
      setPatients(updatedPatients);

      if (selectedPatient) {
        const updated = updatedPatients.find(p => p.patientId === selectedPatient.patientId);
        setSelectedPatient(updated || null);
      }
    } catch (err) {
      console.error("Failed to update patient status:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patient Management</h1>
          <p className="text-muted-foreground mt-1">Manage all registered patients</p>
        </div>
      </div>

      {/* Stats */}
      {!selectedPatient && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-soft border-0">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{stats.activePatients}</div>
              <div className="text-sm text-muted-foreground">Active Patients</div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">{stats.totalPatients}</div>
              <div className="text-sm text-muted-foreground">Total Patients</div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">{stats.totalAppointments}</div>
              <div className="text-sm text-muted-foreground">Total Appointments</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detail View */}
      {selectedPatient ? (
        <Card className="shadow-soft border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Patient Details</CardTitle>
              <CardDescription>Complete profile of the patient</CardDescription>
            </div>
            <Button variant="ghost" onClick={() => setSelectedPatient(null)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary-light">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{selectedPatient.fullName}</h2>
                <p className="text-sm text-muted-foreground">{selectedPatient.email}</p>
                <Badge className={`mt-2 ${getStatusColor(selectedPatient.status)}`}>
                  {selectedPatient.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <p><strong>Gender:</strong> {displayGender(selectedPatient.gender)}</p>
              <p><strong>Country:</strong> {selectedPatient.country || "N/A"}</p>
              <p><strong>Date of Birth:</strong> {selectedPatient.dateOfBirth || "N/A"}</p>
            </div>

            <Button
              className={`mt-4 ${
                selectedPatient.status.toLowerCase() === "active"
                  ? "bg-destructive hover:bg-destructive/80"
                  : "bg-green-600 hover:bg-green-700"
              }`}
              onClick={() => handleStatusChange(selectedPatient.patientId, selectedPatient.status)}
            >
              {selectedPatient.status.toLowerCase() === "active" ? "Suspend Patient" : "Restore Patient"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search */}
          <Card className="shadow-soft border-0">
            <CardHeader>
              <CardTitle className="text-lg">Search Patients</CardTitle>
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

          {/* Patients List */}
          <Card className="shadow-soft border-0">
            <CardHeader>
              <CardTitle>All Patients ({filteredPatients.length})</CardTitle>
              <CardDescription>Complete list of registered patients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPatients.map((p) => (
                  <div
                    key={p.patientId}
                    className="p-4 rounded-lg border border-border hover:bg-accent/30 transition-all duration-200 flex justify-between items-center"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary-light">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{p.fullName}</h4>
                        <p className="text-sm text-muted-foreground">{p.email}</p>
                        <Badge className={`mt-1 ${getStatusColor(p.status)}`}>{p.status}</Badge>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-accent"
                      onClick={() => setSelectedPatient(p)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
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
