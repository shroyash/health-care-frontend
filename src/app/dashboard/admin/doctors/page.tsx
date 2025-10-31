'use client'

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserPlus, Mail, Phone, MapPin, Award, Clock, Edit, Trash2 } from "lucide-react";

// TypeScript interface for Doctor
interface Doctor {
  id: number;
  name: string;
  specialty: string;
  status: 'active' | 'pending' | 'inactive';
  experience: string;
  phone: string;
  email: string;
  location: string;
  patients: number;
  rating: number;
  availability: 'Available' | 'Busy' | 'On Leave' | 'Pending Approval';
}

// Sample doctors data
const doctors: Doctor[] = [
  { id: 1, name: "Dr. Sarah Wilson", specialty: "General Practice", status: "active", experience: "8 years", phone: "+1 (555) 123-4567", email: "sarah.wilson@hospital.com", location: "Main Building - Floor 2", patients: 156, rating: 4.9, availability: "Available" },
  { id: 2, name: "Dr. Michael Brown", specialty: "Cardiology", status: "active", experience: "12 years", phone: "+1 (555) 234-5678", email: "michael.brown@hospital.com", location: "Cardiology Wing - Floor 3", patients: 98, rating: 4.8, availability: "Busy" },
  { id: 3, name: "Dr. Lisa Anderson", specialty: "Orthopedics", status: "active", experience: "10 years", phone: "+1 (555) 345-6789", email: "lisa.anderson@hospital.com", location: "Orthopedic Center - Floor 1", patients: 124, rating: 4.7, availability: "Available" },
  { id: 4, name: "Dr. James Wilson", specialty: "Dermatology", status: "pending", experience: "6 years", phone: "+1 (555) 456-7890", email: "james.wilson@hospital.com", location: "Dermatology Clinic - Floor 4", patients: 0, rating: 0, availability: "Pending Approval" },
  { id: 5, name: "Dr. Emily Chen", specialty: "Pediatrics", status: "active", experience: "9 years", phone: "+1 (555) 567-8901", email: "emily.chen@hospital.com", location: "Children's Wing - Floor 2", patients: 203, rating: 4.9, availability: "Available" },
  { id: 6, name: "Dr. Robert Garcia", specialty: "Neurology", status: "inactive", experience: "15 years", phone: "+1 (555) 678-9012", email: "robert.garcia@hospital.com", location: "Neurology Department - Floor 5", patients: 87, rating: 4.6, availability: "On Leave" }
];

// Helper functions for styling
const getStatusColor = (status: Doctor['status']) => {
  switch (status) {
    case "active": return "bg-success-light text-success border-success/20";
    case "pending": return "bg-warning-light text-warning border-warning/20";
    case "inactive": return "bg-muted text-muted-foreground border-muted/20";
    default: return "bg-muted text-muted-foreground";
  }
};

const getAvailabilityColor = (availability: Doctor['availability']) => {
  switch (availability) {
    case "Available": return "text-success";
    case "Busy": return "text-warning";
    case "On Leave": return "text-muted-foreground";
    case "Pending Approval": return "text-warning";
    default: return "text-muted-foreground";
  }
};

export default function DoctorManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");

  const specialties = useMemo(() => [...new Set(doctors.map(d => d.specialty))], []);

  // Memoized filtered doctors
  const filteredDoctors = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return doctors.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(search)
        || d.specialty.toLowerCase().includes(search)
        || d.email.toLowerCase().includes(search);
      const matchesStatus = statusFilter === "all" || d.status === statusFilter;
      const matchesSpecialty = specialtyFilter === "all" || d.specialty === specialtyFilter;
      return matchesSearch && matchesStatus && matchesSpecialty;
    });
  }, [searchTerm, statusFilter, specialtyFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Doctor Management</h1>
          <p className="text-muted-foreground mt-1">Manage all healthcare professionals</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover">
          <UserPlus className="h-4 w-4 mr-2" /> Add New Doctor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-soft border-0">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {doctors.filter(d => d.status === 'active').length}
            </div>
            <div className="text-sm text-muted-foreground">Active Doctors</div>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-0">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">
              {doctors.filter(d => d.status === 'pending').length}
            </div>
            <div className="text-sm text-muted-foreground">Pending Approval</div>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-0">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{specialties.length}</div>
            <div className="text-sm text-muted-foreground">Specialties</div>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-0">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">
              {doctors.reduce((sum, doctor) => sum + doctor.patients, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Patients</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-soft border-0">
        <CardHeader>
          <CardTitle className="text-lg">Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name, specialty, or email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map(d => (
          <Card key={d.id} className="shadow-soft border-0 hover:shadow-medium transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{d.name}</CardTitle>
                    <CardDescription className="text-primary font-medium">{d.specialty}</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(d.status)}>{d.status}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><Phone className="h-3 w-3 text-muted-foreground" /> {d.phone}</div>
                <div className="flex items-center gap-2"><Mail className="h-3 w-3 text-muted-foreground" /> {d.email}</div>
                <div className="flex items-center gap-2"><MapPin className="h-3 w-3 text-muted-foreground" /> {d.location}</div>
                <div className="flex items-center gap-2"><Clock className={`h-3 w-3 ${getAvailabilityColor(d.availability)}`} /> <span className={getAvailabilityColor(d.availability)}>{d.availability}</span></div>
              </div>

              {d.status === 'active' && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                  <div className="text-center"><div className="text-lg font-bold">{d.patients}</div><div className="text-xs text-muted-foreground">Patients</div></div>
                  <div className="text-center"><div className="text-lg font-bold">{d.rating}</div><div className="text-xs text-muted-foreground">Rating</div></div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {d.status === 'pending' ? (
                  <>
                    <Button size="sm" className="flex-1 bg-success hover:bg-success/90">Approve</Button>
                    <Button variant="outline" size="sm" className="flex-1 hover:bg-destructive/10 hover:text-destructive">Reject</Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="flex-1 hover:bg-accent"><Edit className="h-3 w-3 mr-1" /> Edit</Button>
                    <Button variant="outline" size="sm" className="hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <Card className="shadow-soft border-0">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No doctors found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
