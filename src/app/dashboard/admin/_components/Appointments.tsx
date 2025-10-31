import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Clock, User } from "lucide-react";

const appointments = [
  {
    id: 1,
    patient: "John Smith",
    doctor: "Dr. Sarah Wilson",
    time: "10:00 AM",
    date: "Today",
    status: "confirmed",
    type: "General Checkup"
  },
  {
    id: 2,
    patient: "Emily Johnson",
    doctor: "Dr. Michael Brown",
    time: "11:30 AM", 
    date: "Today",
    status: "in-progress",
    type: "Cardiology"
  },
  {
    id: 3,
    patient: "Robert Davis",
    doctor: "Dr. Lisa Anderson",
    time: "2:00 PM",
    date: "Today",
    status: "confirmed",
    type: "Orthopedics"
  },
  {
    id: 4,
    patient: "Maria Garcia",
    doctor: "Dr. James Wilson",
    time: "3:30 PM",
    date: "Today", 
    status: "pending",
    type: "Dermatology"
  },
  {
    id: 5,
    patient: "David Miller",
    doctor: "Dr. Sarah Wilson",
    time: "9:00 AM",
    date: "Tomorrow",
    status: "confirmed",
    type: "General Checkup"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-success-light text-success border-success/20";
    case "in-progress": 
      return "bg-primary-light text-primary border-primary/20";
    case "pending":
      return "bg-warning-light text-warning border-warning/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function AppointmentsList() {
  return (
    <Card className="shadow-soft border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-foreground">
              Recent Appointments
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage and monitor all appointments
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="hover:bg-accent">
            View All
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search appointments..."
            className="pl-10 bg-background border-border"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary-light">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{appointment.patient}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{appointment.date}</span>
                    <Clock className="h-3 w-3 ml-2" />
                    <span>{appointment.time}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{appointment.doctor}</p>
                  <p className="text-xs text-muted-foreground">{appointment.type}</p>
                </div>
                <Badge className={`capitalize ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}