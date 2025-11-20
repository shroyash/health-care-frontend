// app/patients/page.tsx
"use client"; // Required for client-side interactivity in Next.js 13+

import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Users, FileText, Calendar, Plus, Eye } from "lucide-react";

interface MedicalEntry {
  id: number;
  date: string;
  type: "appointment" | "diagnosis" | "prescription" | "report";
  title: string;
  description: string;
  doctor: string;
}

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  lastVisit: string;
  condition: string;
  medicalHistory: MedicalEntry[];
}

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [newEntry, setNewEntry] = useState({
    type: "appointment" as const,
    title: "",
    description: ""
  });

  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@email.com",
      phone: "(555) 123-4567",
      dateOfBirth: "1985-03-15",
      lastVisit: "2024-01-15",
      condition: "Hypertension",
      medicalHistory: [
        {
          id: 1,
          date: "2024-01-15",
          type: "appointment",
          title: "Follow-up Visit",
          description: "Blood pressure monitoring, medication adjustment",
          doctor: "Dr. Sarah Johnson"
        },
        {
          id: 2,
          date: "2023-12-10",
          type: "prescription",
          title: "Lisinopril 10mg",
          description: "Take once daily for blood pressure control",
          doctor: "Dr. Sarah Johnson"
        }
      ]
    },
    {
      id: 2,
      name: "Robert Chen",
      email: "robert@email.com",
      phone: "(555) 987-6543",
      dateOfBirth: "1978-11-22",
      lastVisit: "2024-01-20",
      condition: "Diabetes Type 2",
      medicalHistory: [
        {
          id: 3,
          date: "2024-01-20",
          type: "diagnosis",
          title: "Diabetes Management Review",
          description: "HbA1c: 7.2%, adjust metformin dosage",
          doctor: "Dr. Sarah Johnson"
        }
      ]
    }
  ]);

  const handleAddMedicalEntry = () => {
    if (!selectedPatient || !newEntry.title || !newEntry.description) {
      toast.error("Please fill in all fields");
      return;
    }

    const entry: MedicalEntry = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      type: newEntry.type,
      title: newEntry.title,
      description: newEntry.description,
      doctor: "Dr. Sarah Johnson"
    };

    setPatients((prev) =>
      prev.map((patient) =>
        patient.id === selectedPatient.id
          ? { ...patient, medicalHistory: [entry, ...patient.medicalHistory] }
          : patient
      )
    );

    setNewEntry({ type: "appointment", title: "", description: "" });

    toast.success("New medical entry added");
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEntryIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="w-4 h-4" />;
      case "diagnosis":
        return <FileText className="w-4 h-4" />;
      case "prescription":
        return <Plus className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getEntryBadge = (type: string) => {
    switch (type) {
      case "appointment":
        return "status-approved";
      case "diagnosis":
        return "status-pending";
      case "prescription":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "status-approved";
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Search */}
      <Card className="medical-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search patients by name or condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 medical-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Patient Records</span>
            <Badge className="status-approved">{filteredPatients.length} Patients</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="p-4 rounded-lg border border-border hover:shadow-[var(--shadow-card)] transition-[var(--transition-smooth)]">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-card-foreground">{patient.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                      <p>📧 {patient.email}</p>
                      <p>📱 {patient.phone}</p>
                      <p>🎂 Born: {patient.dateOfBirth}</p>
                      <p>📅 Last visit: {patient.lastVisit}</p>
                    </div>
                    <Badge className="mt-2 status-pending">{patient.condition}</Badge>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => setSelectedPatient(patient)}>
                      <Eye className="w-4 h-4 mr-2" /> View History
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Medical History - {patient.name}</DialogTitle>
                    </DialogHeader>

                    {/* Add new entry & medical history (same as your previous code) */}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}

          {filteredPatients.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No patients found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
