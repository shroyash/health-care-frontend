'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import { saveWeeklySchedule, getDoctorSchedule } from "@/lib/api/doctorDashboard";
import {
  ScheduleDto,
  SaveDoctorScheduleDto,
  DoctorScheduleResponseDto,
} from "@/lib/type/doctorDashboard";

/* ------------------- Types ------------------- */
interface TimeSlot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

/* ------------------- Utils ------------------- */
const formatTime = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/* ------------------- Existing Schedule ------------------- */
const ExistingSchedule = ({ schedules }: { schedules: TimeSlot[] }) => {
  return (
    <Card className="shadow-2xl rounded-xl h-full border-l-8 border-blue-300">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center gap-2 text-blue-700 text-lg font-semibold">
          <Clock className="w-6 h-6" /> Your Schedule
        </CardTitle>
      </CardHeader>

      <CardContent className="overflow-y-auto max-h-[calc(100vh-100px)] p-6">
        {schedules.length ? (
          <div className="space-y-4">
            {schedules.map((slot) => (
              <div
                key={slot.id}
                className="flex justify-between items-center border border-blue-200 p-4 rounded-xl shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <Badge className="bg-blue-200 text-blue-800">
                    {slot.date}
                  </Badge>

                  <span className="text-gray-700 font-medium">
                    {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                  </span>
                </div>

                <Badge
                  className={
                    slot.available
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }
                >
                  {slot.available ? "Available" : "Booked"}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-12 font-medium">
            No schedule set yet
          </p>
        )}
      </CardContent>
    </Card>
  );
};

/* ------------------- Add Schedule ------------------- */
const EditableSchedule = ({
  onSave,
  doctorSchedule,
}: {
  onSave?: () => void;
  doctorSchedule: TimeSlot[];
}) => {
  const [newSlot, setNewSlot] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });

  const [tempSlots, setTempSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddSlot = () => {
    const { date, startTime, endTime } = newSlot;

    if (!date || !startTime || !endTime) {
      toast.error("Please fill all fields");
      return;
    }

    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);

    if (start < new Date()) {
      toast.error("Cannot schedule in the past");
      return;
    }

    if ((end.getTime() - start.getTime()) / (1000 * 60 * 60) !== 1) {
      toast.error("Slot duration must be exactly 1 hour");
      return;
    }

    const overlaps = [...tempSlots, ...doctorSchedule].some((slot) => {
      if (slot.date !== date) return false;
      const s = new Date(`${slot.date}T${slot.startTime}:00`);
      const e = new Date(`${slot.date}T${slot.endTime}:00`);
      return start < e && end > s;
    });

    if (overlaps) {
      toast.error("This slot overlaps with an existing slot");
      return;
    }

    setTempSlots((prev) => [
      ...prev,
      { id: Date.now(), ...newSlot, available: true },
    ]);

    setNewSlot({ date: "", startTime: "", endTime: "" });
  };

  const handleDeleteTempSlot = (id: number) => {
    setTempSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveToServer = async () => {
    if (!tempSlots.length) {
      toast.error("Add at least one slot");
      return;
    }

    try {
      setLoading(true);

      const dto: SaveDoctorScheduleDto = {
        schedules: tempSlots.map((slot) => ({
          scheduleDate: new Date(
            `${slot.date}T${slot.startTime}:00`
          ).toISOString(),
          startTime: slot.startTime,
          endTime: slot.endTime,
          available: true,
        })),
      };

      await saveWeeklySchedule(dto);

      toast.success("Schedule saved successfully");
      setTempSlots([]);
      onSave?.();
    } catch {
      toast.error("Failed to save schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-2xl rounded-xl h-full border-l-8 border-blue-300 flex flex-col">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center gap-2 text-blue-700 text-lg font-semibold">
          <Plus className="w-6 h-6" /> Add Schedule
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 flex flex-col h-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            type="date"
            value={newSlot.date}
            onChange={(e) =>
              setNewSlot({ ...newSlot, date: e.target.value })
            }
          />
          <Input
            type="time"
            value={newSlot.startTime}
            onChange={(e) =>
              setNewSlot({ ...newSlot, startTime: e.target.value })
            }
          />
          <Input
            type="time"
            value={newSlot.endTime}
            onChange={(e) =>
              setNewSlot({ ...newSlot, endTime: e.target.value })
            }
          />
        </div>

        <Button onClick={handleAddSlot} className="bg-green-600 mb-4">
          <Plus className="w-4 h-4 mr-2" /> Add Slot
        </Button>

        {tempSlots.map((slot) => (
          <div
            key={slot.id}
            className="flex justify-between items-center border p-4 rounded-lg mb-2"
          >
            <span>
              {slot.date} • {formatTime(slot.startTime)} –{" "}
              {formatTime(slot.endTime)}
            </span>

            <Button
              variant="ghost"
              onClick={() => handleDeleteTempSlot(slot.id)}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        ))}

        <Button
          onClick={handleSaveToServer}
          className="bg-blue-600 mt-auto"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save All Slots"}
        </Button>
      </CardContent>
    </Card>
  );
};

/* ------------------- Main Page ------------------- */
const Schedule = () => {
  const [doctorSchedule, setDoctorSchedule] = useState<TimeSlot[]>([]);

  const fetchSchedule = async () => {
    try {
      const response: DoctorScheduleResponseDto =
        await getDoctorSchedule();

      const mapped: TimeSlot[] = response.schedules
        .map((slot: ScheduleDto) => ({
          id: slot.scheduleId,
          date: slot.scheduleDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          available: slot.available,
        }))
        .filter(
          (slot) =>
            new Date(`${slot.date}T${slot.startTime}`).getTime() >=
            Date.now()
        )
        .sort(
          (a, b) =>
            new Date(`${a.date}T${a.startTime}`).getTime() -
            new Date(`${b.date}T${b.startTime}`).getTime()
        );

      setDoctorSchedule(mapped);
    } catch {
      toast.error("Failed to load schedule");
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  return (
    <div className="h-screen w-full bg-gray-50 p-8 flex flex-col md:flex-row gap-6">
      <div className="md:w-1/2 h-full">
        <ExistingSchedule schedules={doctorSchedule} />
      </div>
      <div className="md:w-1/2 h-full">
        <EditableSchedule
          onSave={fetchSchedule}
          doctorSchedule={doctorSchedule}
        />
      </div>
    </div>
  );
};

export default Schedule;
