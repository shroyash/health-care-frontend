import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Check, X } from "lucide-react";
import { DoctorRequestType } from "../_types/DoctorRequestType";

interface DoctorRequestsListProps {
  requests: DoctorRequestType[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onReview: (id: number) => void;
  onViewDetails: (doctor: DoctorRequestType) => void;
}

export default function DoctorRequestsList({
  requests,
  onApprove,
  onReject,
  onReview,
  onViewDetails,
}: DoctorRequestsListProps) {

  const getStatusColor = (status: DoctorRequestType["status"]) => {
    switch (status) {
      case "pending": return "bg-warning-light text-warning border-warning/20";
      case "under-review": return "bg-primary-light text-primary border-primary/20";
      case "approved": return "bg-success-light text-success border-success/20";
      case "rejected": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (requests.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No doctor requests found matching your criteria.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map(request => (
        <div key={request.doctorReqId} className="p-4 rounded-lg border hover:bg-accent/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-lg">{request.userName}</h4>
              <p className="text-sm text-muted-foreground">{request.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(request.status)}>
                {request.status?.replace("-", " ").toUpperCase()}
              </Badge>

              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => onViewDetails(request)}>
                    <Eye className="h-3 w-3 mr-1" /> View
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{request.userName} - Application Details</DialogTitle>

                  </DialogHeader>
                  <div className="space-y-2 mt-2">
                    <p><strong>Email:</strong> {request.email}</p>
        
                  </div>
                </DialogContent>
              </Dialog>

              {request.status === "PENDING" || request.status === "under-review" ? (
                <>
                  <Button size="sm" className="bg-green-500" onClick={() => onApprove(request.doctorReqId)}>
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onReject(request.doctorReqId)}>
                    <X className="h-3 w-3" />
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}