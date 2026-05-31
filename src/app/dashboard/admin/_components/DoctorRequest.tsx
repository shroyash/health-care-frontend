"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getDoctorRequests,
  getPendingDoctorRequests,
  approveDoctorRequest,
  rejectDoctorRequest,
  DoctorRequestDto,
} from "@/lib/api/admin/doctorRequest";

import { Search, Check, X, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

type Tab = "all" | "pending";

const API_BASE_URL = "http://localhost:8003";

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "APPROVED":
      return "bg-green-100 text-green-700 border-green-200";
    case "REJECTED":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

export default function DoctorRequestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allRequests, setAllRequests] = useState<DoctorRequestDto[]>([]);
  const [pendingRequests, setPendingRequests] = useState<DoctorRequestDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [selectedDoctor, setSelectedDoctor] =
    useState<DoctorRequestDto | null>(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [all, pending] = await Promise.all([
          getDoctorRequests(),
          getPendingDoctorRequests(),
        ]);

        setAllRequests(all);
        setPendingRequests(pending);
      } catch (err) {
        toast.error("Failed to load doctor requests");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  
  const displayedRequests = (
    activeTab === "all" ? allRequests : pendingRequests
  ).filter(
    (r) =>
      r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleAction = async (id: number, approve: boolean) => {
    setProcessingId(id);

    try {
      const response = approve
        ? await approveDoctorRequest(id)
        : await rejectDoctorRequest(id);

      if (response.success) {
        setAllRequests((prev) =>
          prev.map((r) =>
            r.doctorReqId === id
              ? { ...r, status: approve ? "APPROVED" : "REJECTED" }
              : r
          )
        );

        setPendingRequests((prev) =>
          prev.filter((r) => r.doctorReqId !== id)
        );

        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setProcessingId(null);
    }
  };

  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Doctor Requests</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setActiveTab("all")}
          className={activeTab === "all" ? "font-bold" : ""}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={activeTab === "pending" ? "font-bold" : ""}
        >
          Pending
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-3 w-4 h-4" />
        <Input
          className="pl-10"
          placeholder="Search..."
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="grid gap-4">
        {displayedRequests.map((req) => (
          <Card key={req.doctorReqId}>
            <CardContent className="p-4 flex justify-between">
              <div>
                <h3 className="font-semibold">{req.userName}</h3>
                <p className="text-sm text-gray-500">{req.email}</p>

                <Badge className={getStatusColor(req.status)}>
                  {req.status}
                </Badge>
              </div>

              <div className="flex gap-2 items-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedDoctor(req);
                    setViewModalOpen(true);
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>

                {req.status === "PENDING" && (
                  <>
                    <Button
                      className="bg-green-600"
                      onClick={() =>
                        handleAction(req.doctorReqId, true)
                      }
                      disabled={processingId === req.doctorReqId}
                    >
                      <Check />
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() =>
                        handleAction(req.doctorReqId, false)
                      }
                      disabled={processingId === req.doctorReqId}
                    >
                      <X />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MODAL */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Doctor Details</DialogTitle>
            <DialogDescription>
              View doctor request info
            </DialogDescription>
          </DialogHeader>

          {selectedDoctor && (
            <div className="space-y-2">
              <p><b>Name:</b> {selectedDoctor.userName}</p>
              <p><b>Email:</b> {selectedDoctor.email}</p>
              <p><b>Status:</b> {selectedDoctor.status}</p>

              {selectedDoctor.doctorLicence && (
                <img
                  src={API_BASE_URL + selectedDoctor.doctorLicence}
                  className="w-full rounded"
                />
              )}
            </div>
          )}

          <DialogFooter>
            {selectedDoctor?.status === "PENDING" && (
              <>
                <Button
                  onClick={() =>
                    handleAction(selectedDoctor.doctorReqId, true)
                  }
                >
                  Approve
                </Button>

                <Button
                  variant="destructive"
                  onClick={() =>
                    handleAction(selectedDoctor.doctorReqId, false)
                  }
                >
                  Reject
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}