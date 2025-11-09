"use client";

import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Mail,User, Edit, Trash2, Eye } from "lucide-react";
import { getAllPatients, getPatientStats } from "@/lib/api/adminDashboard";
import { PatientProfile as Patient , PatientStats as PatientDashboardStats } from "@/lib/type/adminDashboard";

// Helper for badge colors
const getStatusColor = (status: Patient["status"]) => {
  switch (status) {
    case "active":
      return "bg-success-light text-success border-success/20";
    case "inactive":
      return "bg-muted text-muted-foreground border-muted/20";
    default:
      return "bg-muted text-muted-foreground";
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

  // Fetch patients and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsData, statsData] = await Promise.all([getAllPatients(), getPatientStats()]);
        setPatients(patientsData);
        setStats(statsData);
      } catch (err) {
        console.error("Failed to fetch patients or stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtered patients based on search
  const filteredPatients = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return patients.filter(
      (p) =>
        p.fullName.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term)
    );
  }, [patients, searchTerm]);

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
        <Button className="bg-primary hover:bg-primary-hover">
          <UserPlus className="h-4 w-4 mr-2" />
          Register New Patient
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                key={p.id}
                className="p-4 rounded-lg border border-border hover:bg-accent/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary-light">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-semibold text-foreground text-lg">{p.fullName}</h4>
                
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                       
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3 w-3" /> {p.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                     
                      <Badge className={`mt-1 ${getStatusColor(p.status)}`}>{p.status}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="hover:bg-accent">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="hover:bg-accent">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredPatients.length === 0 && (
        <Card className="shadow-soft border-0">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No patients found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
