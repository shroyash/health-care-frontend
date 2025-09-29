"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DoctorSearch from "./DoctorSearch";
import DoctorRequestsList from "./DoctorRequestsList";
import { DoctorRequestType } from "../_types/DoctorRequestType";
import { getAllDoctorPendingReq } from "@/app/api/docterReq";
import { approveOrRejectDoctorReq } from "@/app/api/docterReq";

export default function DoctorRequestLayout() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorRequestType | null>(null);
  const [requests, setRequests] = useState<DoctorRequestType[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch pending doctor requests on mount ---
  useEffect(() => {
    const fetchDoctorRequests = async () => {
      try {
        setLoading(true);
        const response = await getAllDoctorPendingReq(); // backend should return only pending requests
        setRequests(response);
      } catch (error) {
        toast.error("Failed to fetch doctor requests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorRequests();
  }, []);

  // --- Filter requests by search term ---
  const filteredRequests = requests.filter((request) =>
    request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.email.toLowerCase().includes(searchTerm.toLowerCase()) 
  );

  // --- Handlers ---
  const handleStatusChange = async (doctorId: number, status: string) => {
    try {
      // Call backend to approve/reject/review
      await approveOrRejectDoctorReq(doctorId, status);

      // Update frontend state
      setRequests((prev) =>
        prev.map((req) => (req.doctorReqId === doctorId ? { ...req, status } : req))
      );

      // Show toast notifications
      if (status === "approved") {
        toast.success("Doctor Approved: Successfully added to the system.");
      } else if (status === "rejected") {
        toast.error("Doctor Request Rejected.");
      } else if (status === "under-review") {
        toast.info("Request is now under review.");
      }
    } catch (error) {
      toast.error("Failed to update doctor status. Please try again.");
    }
  };

  const handleViewDetails = (doctor: DoctorRequestType) => {
    setSelectedDoctor(doctor);
  };

  // --- Render ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Doctor Requests</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve doctor applications
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-warning border-warning/20">
            {requests.filter((r) => r.status === "pending").length} Pending
          </Badge>
        </div>
      </div>

      {/* Search */}
      <DoctorSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Requests List */}
      {loading ? (
        <p className="text-muted-foreground">Loading doctor requests...</p>
      ) : (
        <DoctorRequestsList
          requests={filteredRequests}
          onApprove={(id) => handleStatusChange(id, "approved")}
          onReject={(id) => handleStatusChange(id, "rejected")}
          onReview={(id) => handleStatusChange(id, "under-review")}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  );
}
