"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { getAllAvailableDoctors , createAppointmentRequest } from "@/lib/api/patientDashboard";
import { DoctorWithSchedule ,CreateAppointmentRequestDto} from "@/lib/type/patientDashboard";

export const CustomRequestForm = () => {
  const [doctors, setDoctors] = useState<DoctorWithSchedule[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [formData, setFormData] = useState({
    doctorProfileId: "",
    day: "",
    startTime: "",
    endTime: "",
    notes: "",
  });

  // Fetch available doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const res = await getAllAvailableDoctors();
        setDoctors(res);
      } catch (err) {
        toast.error("Failed to fetch doctors. Please try again.");
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.doctorProfileId || !formData.day || !formData.startTime || !formData.endTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoadingSubmit(true);
    try {
      const request: CreateAppointmentRequestDto = {
        doctorId: Number(formData.doctorProfileId),
        day: formData.day,
        startTime: formData.startTime,
        endTime: formData.endTime,
        notes: formData.notes,
      };

      await createAppointmentRequest(request);

      toast.success("Appointment request sent successfully!");
      setFormData({ doctorProfileId: "", day: "", startTime: "", endTime: "", notes: "" });
    } catch (error) {
      toast.error("Failed to send request. Please try again.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-border bg-gradient-to-br from-card to-card/95">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">Request Custom Appointment</CardTitle>
        <CardDescription className="text-muted-foreground">
          Can't find a suitable time? Request a custom appointment time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="doctor" className="text-foreground font-medium">Select Doctor *</Label>
            <Select
              value={formData.doctorProfileId}
              onValueChange={(value) => setFormData({ ...formData, doctorProfileId: value })}
              disabled={loadingDoctors}
            >
              <SelectTrigger id="doctor" className="bg-background border-input">
                <SelectValue placeholder={loadingDoctors ? "Loading doctors..." : "Choose a doctor"} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.doctorProfileId} value={doctor.doctorProfileId.toString()}>
                    {doctor.name} - {doctor.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="day" className="text-foreground font-medium">Day *</Label>
              <Input
                id="day"
                type="date"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="bg-background border-input"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-foreground font-medium">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="bg-background border-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-foreground font-medium">End Time *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="bg-background border-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground font-medium">Notes / Reason (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Describe your symptoms or reason for appointment..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-background border-input min-h-[120px] resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={loadingSubmit || loadingDoctors}
            className="w-full"
            size="lg"
          >
            {loadingSubmit ? "Sending Request..." : "Send Custom Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

