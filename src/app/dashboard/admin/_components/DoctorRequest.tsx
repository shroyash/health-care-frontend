"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getAllDoctorRequests,
  getPendingDoctorRequests,
  approveOrRejectDoctor,
} from "@/lib/api/adminDashboard";
import { Search, Check, X, Mail, User, Eye } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { DoctorRequest } from "@/lib/type/adminDashboard";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

type Tab = "all" | "pending";

// Use environment variable for API base URL
const API_BASE_URL = "http://localhost:8003";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "approved":
      return "bg-green-100 text-green-700 border-green-200";
    case "rejected":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

export default function DoctorRequests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allRequests, setAllRequests] = useState<DoctorRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<DoctorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmData, setConfirmData] = useState<{
    doctorReqId: number;
    approve: boolean;
  } | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorRequest | null>(
    null
  );

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const [all, pending] = await Promise.all([
          getAllDoctorRequests(),
          getPendingDoctorRequests(),
        ]);
        setAllRequests(all);
        setPendingRequests(pending);
        console.log("Doctor requests fetched successfully", {
          all,
          pending,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch doctor requests";
        console.error(err);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Debug selected doctor license URL
  useEffect(() => {
    if (selectedDoctor) {
      console.log("Selected Doctor Full Data:", selectedDoctor);
      console.log("Doctor License Value:", selectedDoctor.doctorLicence);
      console.log("Doctor License Type:", typeof selectedDoctor.doctorLicence);
      if (selectedDoctor.doctorLicence) {
        console.log("Full Image URL:", API_BASE_URL + selectedDoctor.doctorLicence);
      }
    }
  }, [selectedDoctor]);

  const displayedRequests = (
    activeTab === "all" ? allRequests : pendingRequests
  ).filter(
    (req) =>
      req.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showConfirmDialog = (doctorReqId: number, approve: boolean) => {
    setConfirmData({ doctorReqId, approve });
    setConfirmDialogOpen(true);
  };

  const handleApproval = async (doctorReqId: number, approve: boolean) => {
    setProcessingId(doctorReqId);
    try {
      const response = await approveOrRejectDoctor(doctorReqId, approve);
      if (response.status) {
        setAllRequests((prev) =>
          prev.map((req) =>
            req.doctorReqId === doctorReqId
              ? { ...req, status: approve ? "approved" : "rejected" }
              : req
          )
        );
        setPendingRequests((prev) =>
          prev.filter((req) => req.doctorReqId !== doctorReqId)
        );
        if (selectedDoctor?.doctorReqId === doctorReqId) {
          setSelectedDoctor({
            ...selectedDoctor,
            status: approve ? "approved" : "rejected",
          });
          setTimeout(() => setViewModalOpen(false), 500);
        }
        toast.success(response.message);
      } else {
        toast.error(response.message || "Server action failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setProcessingId(null);
      setConfirmDialogOpen(false);
      setConfirmData(null);
    }
  };

  const handleViewDetails = (doctor: DoctorRequest) => {
    setSelectedDoctor(doctor);
    setViewModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading doctor requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 m-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-900">Error</h3>
        <p className="text-red-700 text-sm mt-1">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-600 hover:bg-red-700"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Doctor Requests
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 font-medium ${
              activeTab === "all"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600"
            }`}
          >
            All Requests
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 font-medium ${
              activeTab === "pending"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600"
            }`}
          >
            Pending Requests
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Requests List */}
        {displayedRequests.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-gray-500">No doctor requests found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {displayedRequests.map((request) => (
              <Card key={request.doctorReqId}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {request.userName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {request.email}
                      </p>
                      <div className="mt-3">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.replace("-", " ")}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>

                      {request.status.toLowerCase() === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() =>
                              showConfirmDialog(request.doctorReqId, true)
                            }
                            disabled={processingId === request.doctorReqId}
                          >
                            {processingId === request.doctorReqId ? (
                              "..."
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              showConfirmDialog(request.doctorReqId, false)
                            }
                            disabled={processingId === request.doctorReqId}
                          >
                            {processingId === request.doctorReqId ? (
                              "..."
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* View Details Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Doctor Details</DialogTitle>
            <DialogDescription>
              Review the doctor registration information
            </DialogDescription>
          </DialogHeader>

          {!selectedDoctor ? (
            <div className="py-8 text-center">Loading details...</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Name:
                  </label>
                  <p className="text-gray-900 mt-1">
                    {selectedDoctor.userName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Email:
                  </label>
                  <p className="text-gray-900 mt-1">{selectedDoctor.email}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Status:
                </label>
                <div className="mt-2">
                  <Badge className={getStatusColor(selectedDoctor.status)}>
                    {selectedDoctor.status.replace("-", " ")}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Doctor License:
                </label>
          
                {selectedDoctor.doctorLicence && selectedDoctor.doctorLicence.trim() !== "" ? (
                  <Image
                    src={API_BASE_URL + selectedDoctor.doctorLicence}
                    alt={`${selectedDoctor.userName} license`}
                    width={400}
                    height={300}
                    className="rounded-lg border border-gray-200 w-full object-cover max-h-96"
                    unoptimized
                    onError={(e) => {
                      console.error("Image failed to load:", e);
                      console.error("Attempted URL:", API_BASE_URL + selectedDoctor.doctorLicence);
                    }}
                  />
                ) : (
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                    No license uploaded.
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            {selectedDoctor &&
              selectedDoctor.status.toLowerCase() === "pending" && (
                <>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() =>
                      showConfirmDialog(selectedDoctor.doctorReqId, true)
                    }
                    disabled={processingId === selectedDoctor.doctorReqId}
                  >
                    {processingId === selectedDoctor.doctorReqId
                      ? "..."
                      : "Approve"}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      showConfirmDialog(selectedDoctor.doctorReqId, false)
                    }
                    disabled={processingId === selectedDoctor.doctorReqId}
                  >
                    {processingId === selectedDoctor.doctorReqId
                      ? "..."
                      : "Reject"}
                  </Button>
                </>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              <span className="font-semibold">
                {confirmData?.approve ? "approve" : "reject"}
              </span>{" "}
              this doctor request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className={
                confirmData?.approve
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
              onClick={() =>
                confirmData &&
                handleApproval(confirmData.doctorReqId, confirmData.approve)
              }
              disabled={processingId !== null}
            >
              {confirmData?.approve ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}