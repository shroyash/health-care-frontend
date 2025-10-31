'use client'

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Mail, Phone, Calendar, User, Edit, Trash2, Eye } from "lucide-react";

// TypeScript interface for Patient
interface Patient {
  id: number;
  name: string;
  age: number;
  gender: "Male" | "Female";
  phone: string;
  email: string;
  lastVisit: string;
  condition: string;
  status: "active" | "inactive";
  appointments: number;
}

// Sample patient data
const patients: Patient[] = [
  { id: 1, name: "John Smith", age: 45, gender: "Male", phone: "+1 (555) 123-4567", email: "john.smith@email.com", lastVisit: "2024-09-15", condition: "Hypertension", status: "active", appointments: 12 },
  { id: 2, name: "Emily Johnson", age: 32, gender: "Female", phone: "+1 (555) 234-5678", email: "emily.j@email.com", lastVisit: "2024-09-20", condition: "Diabetes Type 2", status: "active", appointments: 8 },
  { id: 3, name: "Robert Davis", age: 58, gender: "Male", phone: "+1 (555) 345-6789", email: "r.davis@email.com", lastVisit: "2024-09-18", condition: "Arthritis", status: "active", appointments: 15 },
  { id: 4, name: "Maria Garcia", age: 28, gender: "Female", phone: "+1 (555) 456-7890", email: "maria.garcia@email.com", lastVisit: "2024-09-10", condition: "Annual Checkup", status: "active", appointments: 3 },
  { id: 5, name: "David Miller", age: 41, gender: "Male", phone: "+1 (555) 567-8901", email: "d.miller@email.com", lastVisit: "2024-08-30", condition: "Back Pain", status: "inactive", appointments: 6 },
  { id: 6, name: "Lisa Thompson", age: 35, gender: "Female", phone: "+1 (555) 678-9012", email: "lisa.t@email.com", lastVisit: "2024-09-19", condition: "Migraine", status: "active", appointments: 9 }
];

// Helper function for badge colors
const getStatusColor = (status: Patient['status']) => {
  switch (status) {
    case "active": return "bg-success-light text-success border-success/20";
    case "inactive": return "bg-muted text-muted-foreground border-muted/20";
    default: return "bg-muted text-muted-foreground";
  }
};

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Memoized filtered patients
  const filteredPatients = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return patients.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term) ||
      p.condition.toLowerCase().includes(term)
    );
  }, [searchTerm]);

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
            <div className="text-2xl font-bold text-primary">
              {patients.filter(p => p.status === 'active').length}
            </div>
            <div className="text-sm text-muted-foreground">Active Patients</div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-0">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {patients.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Patients</div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-0">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">
              {patients.reduce((sum, p) => sum + p.appointments, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Appointments</div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-0">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">
              {Math.round(patients.reduce((sum, p) => sum + p.age, 0) / patients.length)}
            </div>
            <div className="text-sm text-muted-foreground">Average Age</div>
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
              placeholder="Search by name, email, or condition..."
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
            {filteredPatients.map(p => (
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
                        <h4 className="font-semibold text-foreground text-lg">{p.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {p.age} years old • {p.gender}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" /> {p.phone}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3 w-3" /> {p.email}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" /> Last visit: {p.lastVisit}
                        </div>
                        <div className="text-muted-foreground">
                          Condition: <span className="text-foreground font-medium">{p.condition}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {p.appointments} appointments
                      </p>
                      <Badge className={`mt-1 ${getStatusColor(p.status)}`}>{p.status}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="hover:bg-accent"><Eye className="h-3 w-3" /></Button>
                      <Button variant="outline" size="sm" className="hover:bg-accent"><Edit className="h-3 w-3" /></Button>
                      <Button variant="outline" size="sm" className="hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
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
