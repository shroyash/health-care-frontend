import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  Search, 
  Eye, 
  Check, 
  X, 
  FileText, 
  Award, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  User,
  Building,
  Clock
} from "lucide-react";

const doctorRequests = [
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
  },


];

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-warning-light text-warning border-warning/20";
    case "under-review":
      return "bg-primary-light text-primary border-primary/20";
    case "approved":
      return "bg-success-light text-success border-success/20";
    case "rejected":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function DoctorRequests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<typeof doctorRequests[0] | null>(null);
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-soft border-0">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">
              {requests.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm text-muted-foreground">Pending Requests</div>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-0">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {requests.filter(r => r.status === 'under-review').length}
            </div>
            <div className="text-sm text-muted-foreground">Under Review</div>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-0">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">
              {requests.filter(r => r.status === 'approved').length}
            </div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-0">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">
              {requests.filter(r => r.status === 'rejected').length}
            </div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="shadow-soft border-0">
        <CardHeader>
          <CardTitle className="text-lg">Search Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, specialty, or email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card className="shadow-soft border-0">
        <CardHeader>
          <CardTitle>Doctor Applications ({filteredRequests.length})</CardTitle>
          <CardDescription>Review pending doctor registration requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 rounded-lg border border-border hover:bg-accent/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary-light">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-semibold text-foreground text-lg">{request.name}</h4>
                        <p className="text-primary font-medium">{request.specialty}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{request.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{request.phone}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Award className="h-3 w-3" />
                          <span>License: {request.licenseNumber}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Applied: {request.requestDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{request.experience} experience</p>
                      <Badge className={`mt-1 ${getStatusColor(request.status)}`}>
                        {request.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="hover:bg-accent"
                            onClick={() => setSelectedDoctor(request)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-xl">Doctor Application Details</DialogTitle>
                            <DialogDescription>
                              Complete application information for {selectedDoctor?.name}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedDoctor && (
                            <div className="space-y-6">
                              {/* Personal Information */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <User className="h-5 w-5" />
                                      Personal Information
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div>
                                      <Label className="text-sm font-medium">Full Name</Label>
                                      <p className="text-foreground">{selectedDoctor.name}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Email</Label>
                                      <p className="text-foreground">{selectedDoctor.email}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Phone</Label>
                                      <p className="text-foreground">{selectedDoctor.phone}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Specialty</Label>
                                      <p className="text-primary font-medium">{selectedDoctor.specialty}</p>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Professional Information */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <Building className="h-5 w-5" />
                                      Professional Background
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div>
                                      <Label className="text-sm font-medium">Experience</Label>
                                      <p className="text-foreground">{selectedDoctor.experience}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Education</Label>
                                      <p className="text-foreground">{selectedDoctor.education}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Previous Hospital</Label>
                                      <p className="text-foreground">{selectedDoctor.previousHospital}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Request Date</Label>
                                      <p className="text-foreground">{selectedDoctor.requestDate}</p>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Medical License Information */}
                              <Card className="border-primary/20">
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center gap-2 text-primary">
                                    <Award className="h-5 w-5" />
                                    Medical License Information
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">License Number</Label>
                                      <p className="text-foreground font-mono text-lg">{selectedDoctor.licenseNumber}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Issuing State</Label>
                                      <p className="text-foreground">{selectedDoctor.issuingState}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Expiry Date</Label>
                                      <p className="text-foreground">{selectedDoctor.licenseExpiry}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 p-3 bg-success-light rounded-lg">
                                    <Check className="h-4 w-4 text-success" />
                                    <span className="text-success font-medium">License is valid and up to date</span>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Documents */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Submitted Documents
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {Object.entries(selectedDoctor.documents).map(([type, filename]) => (
                                      <div key={type} className="p-3 border border-border rounded-lg hover:bg-accent/30">
                                        <div className="flex items-center gap-2 mb-2">
                                          <FileText className="h-4 w-4 text-primary" />
                                          <span className="font-medium capitalize">{type.replace(/([A-Z])/g, ' $1')}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{filename}</p>
                                        <Button variant="outline" size="sm" className="mt-2 w-full">
                                          View Document
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Personal Statement */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Personal Statement</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <Textarea 
                                    value={selectedDoctor.personalStatement}
                                    readOnly
                                    className="min-h-24 resize-none"
                                  />
                                </CardContent>
                              </Card>

                              {/* Action Buttons */}
                              {selectedDoctor.status === 'pending' && (
                                <div className="flex gap-3 pt-4 border-t border-border">
                                  <Button 
                                    className="flex-1 bg-primary hover:bg-primary-hover"
                                    onClick={() => handleReview(selectedDoctor.id)}
                                  >
                                    <Clock className="h-4 w-4 mr-2" />
                                    Start Review
                                  </Button>
                                  <Button 
                                    className="flex-1 bg-success hover:bg-success/90"
                                    onClick={() => handleApprove(selectedDoctor.id)}
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    className="flex-1"
                                    onClick={() => handleReject(selectedDoctor.id)}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </div>
                              )}

                              {selectedDoctor.status === 'under-review' && (
                                <div className="flex gap-3 pt-4 border-t border-border">
                                  <Button 
                                    className="flex-1 bg-success hover:bg-success/90"
                                    onClick={() => handleApprove(selectedDoctor.id)}
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    className="flex-1"
                                    onClick={() => handleReject(selectedDoctor.id)}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {request.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            className="bg-success hover:bg-success/90"
                            onClick={() => handleApprove(request.id)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleReject(request.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      )}

                      {request.status === 'under-review' && (
                        <>
                          <Button 
                            size="sm" 
                            className="bg-success hover:bg-success/90"
                            onClick={() => handleApprove(request.id)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleReject(request.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredRequests.length === 0 && (
        <Card className="shadow-soft border-0">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No doctor requests found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}