"use client"; 
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
 import DoctorSearch from "./DoctorSearch";
import {DoctorRequestType} from "../_types/DoctorRequestType";
import DoctorRequestsList from "./DoctorRequestsList";

const doctorRequests: DoctorRequestType[] = [
  {
    id: 1,
    name: "Dr. James Wilson",
    email: "james.wilson@email.com",
    phone: "+1 (555) 456-7890",
    specialty: "Dermatology",
    experience: "6 years",
    education: "MD - Harvard Medical School",
    previousHospital: "Boston General Hospital",
    licenseNumber: "DRM-2018-45678",
    licenseExpiry: "2026-12-15",
    issuingState: "Massachusetts",
    requestDate: "2024-09-15",
    status: "pending",
    documents: {
      medicalLicense: "license_james_wilson.pdf",
      cv: "cv_james_wilson.pdf",
      references: "references_james_wilson.pdf"
    },
    personalStatement: "I am passionate about dermatology and have extensive experience treating various skin conditions. I believe I would be a valuable addition to your healthcare team."
  }
];

export default function DoctorRequestLayout() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorRequestType | null>(null);
  const [requests, setRequests] = useState(doctorRequests);

  const filteredRequests = requests.filter(request =>
    request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = (doctorId: number) => {
    setRequests(prev => prev.map(req => 
      req.id === doctorId ? { ...req, status: "approved" } : req
    ));
    toast.success("Doctor Approved: The doctor has been successfully approved and added to the system.");
  };

  const handleReject = (doctorId: number) => {
    setRequests(prev => prev.map(req => 
      req.id === doctorId ? { ...req, status: "rejected" } : req
    ));
    toast.error("Doctor Request Rejected: The doctor request has been rejected.");
  };

  const handleReview = (doctorId: number) => {
    setRequests(prev => prev.map(req => 
      req.id === doctorId ? { ...req, status: "under-review" } : req
    ));
    toast.info("Request Under Review: The doctor request is now under review.");
  };

  const handleViewDetails = (doctor: DoctorRequestType) => {
    setSelectedDoctor(doctor);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Doctor Requests</h1>
          <p className="text-muted-foreground mt-1">Review and approve doctor applications</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-warning border-warning/20">
            {requests.filter(r => r.status === 'pending').length} Pending
          </Badge>
          <Badge variant="outline" className="text-primary border-primary/20">
            {requests.filter(r => r.status === 'under-review').length} Under Review
          </Badge>
        </div>
      </div>

    

      {/* Search */}
      <DoctorSearch 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

      {/* Requests List */}
      <DoctorRequestsList
        requests={filteredRequests}
        onApprove={handleApprove}
        onReject={handleReject}
        onReview={handleReview}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
}