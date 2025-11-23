"use client";

import { useEffect, useState } from "react";
import { getAllAvailableDoctors } from "@/lib/api/patientDashboard";
import { DoctorWithSchedule } from "@/lib/type/patientDashboard";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Calendar, Clock, User } from "lucide-react";

export const AvailableDoctors = ({
  onViewSchedule,
}: {
  onViewSchedule: (doctor: DoctorWithSchedule) => void;
}) => {
  const [doctors, setDoctors] = useState<DoctorWithSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await getAllAvailableDoctors();
        setDoctors(res);
      } catch (err) {
        toast.error("Failed to fetch doctors");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  if (loading) return <p className="text-center text-muted-foreground">Loading doctors...</p>;
  if (doctors.length === 0)
    return <p className="text-center text-muted-foreground">No available doctors found.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {doctors.map((doctor) => (
        <Card key={doctor.doctorProfileId}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {doctor.name}
            </CardTitle>
            <CardDescription>{doctor.specialty}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="flex flex-col gap-2 text-sm text-foreground">
              {doctor.schedules.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-accent" />
                  <span>{slot.dayOfWeek}</span>
                  <Clock className="h-4 w-4 text-accent" />
                  <span>{slot.startTime} - {slot.endTime}</span>
                </div>
              ))}
            </div>

            <Button className="w-full" onClick={() => onViewSchedule(doctor)}>
              View Schedule
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
