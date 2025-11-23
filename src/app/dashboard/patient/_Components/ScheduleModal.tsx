"use client";

import { useState } from "react";
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DoctorSchedule, DoctorWithSchedule } from "@/lib/type/patientDashboard";
import { toast } from "react-toastify";
import { createAppointmentRequest } from "@/lib/api/patientDashboard";

export interface ScheduleModalProps {
  doctor: DoctorWithSchedule | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduleModal = ({ doctor, isOpen, onClose }: ScheduleModalProps) => {
  const [selectedSlot, setSelectedSlot] = useState<DoctorSchedule | null>(null);
  const [sending, setSending] = useState(false);

  const handleSendRequest = async () => {
    if (!doctor || !selectedSlot) return;

    setSending(true);
    try {
      await createAppointmentRequest({
        doctorId: doctor.doctorProfileId,
        day: selectedSlot.dayOfWeek,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });

      toast.success("Appointment request sent!");
      onClose();
      setSelectedSlot(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send request.");
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedSlot(null);
  };

  if (!doctor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{doctor.name}'s Schedule</DialogTitle>
          <DialogDescription>Select a time slot to request an appointment</DialogDescription>
        </DialogHeader>

        {!doctor.schedules?.length ? (
          <p className="text-center text-muted-foreground mt-4">No available slots.</p>
        ) : (
          <div className="space-y-4 mt-4">
            {doctor.schedules.map((slot, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border cursor-pointer ${
                  selectedSlot === slot ? "border-primary bg-primary/10" : "border-border"
                }`}
                onClick={() => slot.available && setSelectedSlot(slot)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-5 w-5" />
                    <span className="font-semibold">{slot.dayOfWeek}</span>
                    <Clock className="h-5 w-5" />
                    <span>
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                  {slot.available ? (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full">
                      Available
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full">
                      Unavailable
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button disabled={!selectedSlot || sending} onClick={handleSendRequest} className="flex-1">
            {sending ? "Sending..." : "Send Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
