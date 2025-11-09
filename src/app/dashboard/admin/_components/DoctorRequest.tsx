"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getAllDoctorRequests, getPendingDoctorRequests, approveOrRejectDoctor } from "@/lib/api/adminDashboard";
import { Search, Check, X, Mail, Award, User } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DoctorRequest } from "@/lib/type/adminDashboard";
import "react-toastify/dist/ReactToastify.css";

type Tab = "all" | "pending";


const getStatusColor = (status: string) => {
  switch (status) {
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [allRequests, setAllRequests] = useState<DoctorRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<DoctorRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("all");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const [all, pending] = await Promise.all([
          getAllDoctorRequests(),
          getPendingDoctorRequests(),
        ]);
        setAllRequests(all);
        setPendingRequests(pending);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch doctor requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const displayedRequests = (activeTab === "all" ? allRequests : pendingRequests).filter(
    (req) =>
      req.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApproval = async (doctorReqId: number, approve: boolean) => {
    setProcessingId(doctorReqId);
    try {
      const response = await approveOrRejectDoctor(doctorReqId, approve);
      if (response.status) {
        // Update all requests
        setAllRequests(prev =>
          prev.map(req =>
            req.doctorReqId === doctorReqId ? { ...req, status: approve ? "approved" : "rejected" } : req
          )
        );
        // Remove from pendingRequests if approved/rejected
        setPendingRequests(prev => prev.filter(req => req.doctorReqId !== doctorReqId));
        toast.success(response.message);
      } else {
        toast.error(response.message || "Server action failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <p className="text-center py-10 text-muted-foreground">Loading doctor requests...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "all" ? "default" : "outline"}
          onClick={() => setActiveTab("all")}
        >
          All Requests
        </Button>
        <Button
          variant={activeTab === "pending" ? "default" : "outline"}
          onClick={() => setActiveTab("pending")}
        >
          Pending Requests
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by doctor name, username or email..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Requests List */}
      {displayedRequests.length === 0 ? (
        <p className="text-center py-10 text-muted-foreground">No doctor requests found.</p>
      ) : (
        <div className="space-y-4">
          {displayedRequests.map((request) => (
            <Card
              key={request.doctorReqId}
              className="border border-border hover:bg-accent/20 transition-all duration-200"
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-lg">{request.userName}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {request.email}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex justify-between items-center mt-2">
                <Badge className={`${getStatusColor(request.status)}`}>
                  {request.status.replace("-", " ")}
                </Badge>
              </CardContent>

              {/* Approve / Reject buttons only for pending */}
              {request.status === "PENDING" && (
                <CardContent className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={processingId === request.doctorReqId}
                    onClick={() => handleApproval(request.doctorReqId, true)}
                  >
                    {processingId === request.doctorReqId ? "..." : <Check className="h-3 w-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={processingId === request.doctorReqId}
                    onClick={() => handleApproval(request.doctorReqId, false)}
                  >
                    {processingId === request.doctorReqId ? "..." : <X className="h-3 w-3" />}
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
