"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Search, User, Eye, ArrowLeft } from "lucide-react";

import {
  getAllPatients,
  suspendPatient,
  restorePatient,
} from "@/lib/api/adminDashboard";

import { useDashboardStats } from "@/context/DashboardStatsContext";
import {adminPatientApi} from "@/lib/api/patient.api";
import type { PatientAppointmentDto } from "@/lib/type/appointment.types";
import { PatientProfileDTO } from "@/lib/type/patient.types";

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

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientProfileDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] =
    useState<PatientProfileDTO | null>(null);

  // ✅ FIXED STATS USAGE
  const { statsData } = useDashboardStats();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientsData = await adminPatientApi.getAll();

        setPatients(patientsData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPatients = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return patients.filter((p) => {
      return (
        (p as any).fullName?.toLowerCase()?.includes(term) ||
        (p as any).email?.toLowerCase()?.includes(term)
      );
    });
  }, [patients, searchTerm]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Patient Management</h1>
        <p className="text-muted-foreground">
          Manage all registered patients
        </p>
      </div>

      {/* ✅ FIXED STATS SECTION */}
      {!selectedPatient && statsData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-soft border-0">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">
                {statsData.totalPatients ?? 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Active Patients
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {statsData.totalPatients ?? 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Patients
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">
                {statsData.totalAppointmentsToday ?? 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Today Appointments
              </div>
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
              <CardDescription>
                Complete profile of the patient
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              onClick={() => setSelectedPatient(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  {(selectedPatient as any).fullName}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {(selectedPatient as any).email}
                </p>

                <Badge className="mt-2">
                  {(selectedPatient as any).status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search */}
          <Card className="shadow-soft border-0">
            <CardHeader>
              <CardTitle>Search Patients</CardTitle>
            </CardHeader>

            <CardContent>
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* List */}
          <Card className="shadow-soft border-0">
            <CardHeader>
              <CardTitle>
                All Patients ({patients.length})
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {patients.map((p, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border p-4 rounded"
                >
                  <div>
                    <h4 className="font-semibold">
                      {(p as any).fullName}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {(p as any).email}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPatient(p)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}