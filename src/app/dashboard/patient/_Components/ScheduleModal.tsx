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

import {
  DoctorSchedule,
  DoctorWithSchedule,
} from "@/lib/type/patientDashboard";

import { toast } from "react-toastify";
import { patientAppointmentRequestApi } from "@/lib/api/appointment-request.api";

import {
  format,
  parse,
  parseISO,
  isValid,
} from "date-fns";

export interface ScheduleModalProps {
  doctor: DoctorWithSchedule | null;
  isOpen: boolean;
  onClose: () => void;
}

/* ── SAFE DATE FORMAT ───────────────────────────── */
const formatDate = (dateStr?: string) => {
  if (!dateStr) return "Invalid date";

  const date = parseISO(dateStr);

  if (!isValid(date)) return "Invalid date";

  return format(date, "EEEE, MMMM d, yyyy");
};

/* ── SAFE TIME FORMAT ───────────────────────────── */
const formatTime = (timeStr?: string) => {
  if (!timeStr) return "";

  const parsed = parse(
    timeStr,
    timeStr.length > 5 ? "HH:mm:ss" : "HH:mm",
    new Date()
  );

  if (!isValid(parsed)) return "";

  return format(parsed, "hh:mm a");
};

export const ScheduleModal = ({
  doctor,
  isOpen,
  onClose,
}: ScheduleModalProps) => {
  const [selectedSlot, setSelectedSlot] =
    useState<DoctorSchedule | null>(null);

  const [sending, setSending] = useState(false);

  /* ── SEND REQUEST ───────────────────────────── */
  const handleSendRequest = async () => {
    if (!doctor || !selectedSlot) return;

    setSending(true);

    try {
      await patientAppointmentRequestApi.create({
        doctorId: doctor.doctorProfileId,
        doctorName: doctor.name,
        date: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });

      toast.success("Appointment request sent!");
      handleClose();
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
          <DialogTitle className="text-2xl font-bold">
            Dr. {doctor.name}'s Schedule
          </DialogTitle>
          <DialogDescription>
            Select a time slot to request an appointment
          </DialogDescription>
        </DialogHeader>

        {/* ── NO SLOTS ───────────────────────────── */}
        {!doctor.schedules?.length ? (
          <p className="text-center text-muted-foreground mt-4">
            No available slots.
          </p>
        ) : (
          <div className="space-y-4 mt-4">
            {doctor.schedules.map((slot, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-colors ${
                  slot.available
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-60"
                } ${
                  selectedSlot?.date === slot.date &&
                  selectedSlot?.startTime === slot.startTime
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() =>
                  slot.available && setSelectedSlot(slot)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-sm">
                        {formatDate(slot.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {formatTime(slot.startTime)} -{" "}
                        {formatTime(slot.endTime)}
                      </span>
                    </div>
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

        {/* ── ACTIONS ───────────────────────────── */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>

          <Button
            disabled={!selectedSlot || sending}
            onClick={handleSendRequest}
            className="flex-1"
          >
            {sending ? "Sending..." : "Send Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};