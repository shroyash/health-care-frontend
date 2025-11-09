'use client';

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserPlus, Mail, Phone, MapPin, Award, Clock, Edit, Trash2 } from "lucide-react";
import { DoctorProfile } from "@/lib/type/adminDashboard";
import { toast } from "react-toastify";
import { useDashboardStats } from "@/context/DashboardStatsContext";

import {
  getPendingDoctorCount,
  getAllDoctors,
  suspendDoctor,
  restoreDoctor,
} from "@/lib/api/adminDashboard";

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




export default function DoctorManagementPage() {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  //Fetch all doctors and pending count
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allDoctors, pending] = await Promise.all([
          getAllDoctors(),
          getPendingDoctorCount(),
        ]);
        console.log(allDoctors);
        setDoctors(allDoctors);
        console.log(pending);
        setPendingCount(pending);
      } catch (error) {
        toast.error("Failed to load doctors data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const specialties = useMemo(() => [...new Set(doctors.map((d) => d.specialization))], [doctors]);

   const { statsData } = useDashboardStats();

  const filteredDoctors = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return doctors.filter((d) => {
      const matchesSearch =
        d.fullName.toLowerCase().includes(search) ||
        d.specialization.toLowerCase().includes(search) ||
        d.email.toLowerCase().includes(search);
      const matchesStatus = statusFilter === "all" || d.status === statusFilter;
      const matchesSpecialty = specialtyFilter === "all" || d.specialization === specialtyFilter;
      return matchesSearch && matchesStatus && matchesSpecialty;
    });
  }, [searchTerm, statusFilter, specialtyFilter, doctors]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Doctor Management</h1>
          <p className="text-muted-foreground mt-1">Manage all healthcare professionals</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-soft border-0">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {statsData.totalDoctors}
            </div>
            <div className="text-sm text-muted-foreground">Active Doctors</div>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-0">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
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
          {/* <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {doctors.reduce((sum, d) => sum + d.patients, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Patients</div>
          </CardContent> */}
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
                placeholder="Search by name, specialty, or email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>


            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Doctors Grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading doctors...</div>
      ) : filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((d) => (
            <Card key={d.doctorProfileId} className="shadow-soft border-0 hover:shadow-medium transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{d.fullName}</CardTitle>
                      <CardDescription className="text-primary font-medium">{d.specialization}</CardDescription>
                    </div>
                  </div>
                  {/* <Badge className={getStatusColor(d.status)}>{d.status}</Badge> */}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-muted-foreground" /> {d.contactNumber}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-muted-foreground" /> {d.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" /> {d.workingAT}
                  </div>
                  {/* <div className="flex items-center gap-2">
                    <Clock className={`h-3 w-3 ${getAvailabilityColor(d.workingAT)}`} />
                    <span className={getAvailabilityColor(d.workingAT)}>{d.availability}</span>
                  </div> */}
                </div>

                <div className="btn suspend">
                  <Button className="btn bg-red-400" onClick={() => suspendDoctor(d.doctorProfileId) }>Suspend</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-soft border-0">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No doctors found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
