"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

import {
  getAllAvailableDoctors,
  createAppointmentRequest,
} from "@/lib/api/patientDashboard";

import {
  DoctorWithSchedule,
  CreateAppointmentRequestDto,
} from "@/lib/type/patientDashboard";

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

  // ✅ Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const res = await getAllAvailableDoctors();
        setDoctors(res);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          "Failed to fetch doctors. Please try again.";
        toast.error(message);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  // ✅ Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔴 Required validation
    if (
      !formData.doctorProfileId ||
      !formData.day ||
      !formData.startTime ||
      !formData.endTime
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // 🔴 Time validation
    if (formData.startTime >= formData.endTime) {
      toast.error("End time must be after start time");
      return;
    }

    // 🔴 Prevent double click
    if (loadingSubmit) return;

    setLoadingSubmit(true);

    try {
      const request: CreateAppointmentRequestDto = {
        doctorId: formData.doctorProfileId,
        date: formData.day,
        startTime: formData.startTime,
        endTime: formData.endTime,
        notes: formData.notes,
      };

      await createAppointmentRequest(request);

      toast.success("Appointment request sent successfully!");

      // ✅ Reset form
      setFormData({
        doctorProfileId: "",
        day: "",
        startTime: "",
        endTime: "",
        notes: "",
      });
    } catch (error: any) {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message ||
        "Failed to send request. Please try again.";

      // 🔥 Specific handling
      if (status === 409) {
        toast.error(message); // "You already requested this slot"
      } else if (status === 400) {
        toast.error(message); // validation error from backend
      } else if (status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(message);
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-border bg-gradient-to-br from-card to-card/95">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Request Custom Appointment
        </CardTitle>
        <CardDescription>
          Can't find a suitable time? Request a custom appointment time
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Doctor Select */}
          <div className="space-y-2">
            <Label>Select Doctor *</Label>
            <Select
              value={formData.doctorProfileId}
              onValueChange={(value) =>
                setFormData({ ...formData, doctorProfileId: value })
              }
              disabled={loadingDoctors}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingDoctors ? "Loading..." : "Choose a doctor"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem
                    key={doctor.doctorProfileId}
                    value={doctor.doctorProfileId.toString()}
                  >
                    {doctor.name} - {doctor.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Day *</Label>
              <Input
                type="date"
                value={formData.day}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  setFormData({ ...formData, day: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Start Time *</Label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
              />
            </div>

            <div>
              <Label>End Time *</Label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Describe your symptoms..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loadingSubmit || loadingDoctors}
            className="w-full bg-blue-600 text-white"
          >
            {loadingSubmit ? "Sending..." : "Send Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};