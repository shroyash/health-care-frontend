'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Trash2, Info, CalendarDays } from "lucide-react";
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
  const d = new Date();
  d.setHours(h, m);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
};

const getNext7Days = () =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      label:
        i === 0
          ? "Today"
          : i === 1
          ? "Tomorrow"
          : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      value: d.toISOString().split("T")[0],
    };
  });

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const d = new Date();
  d.setHours(i, 0, 0, 0);
  return {
    value: `${String(i).padStart(2, "0")}:00`,
    label: d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }),
  };
});

const getEndTime = (start: string) => {
  const h = parseInt(start.split(":")[0]);
  return `${String((h + 1) % 24).padStart(2, "0")}:00`;
};

/* ------------------- Existing Schedule ------------------- */
const ExistingSchedule = ({ schedules }: { schedules: TimeSlot[] }) => (
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
                <Badge className="bg-blue-200 text-blue-800">{slot.date}</Badge>
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
        <p className="text-center text-gray-400 py-12 font-medium">No schedule set yet</p>
      )}
    </CardContent>
  </Card>
);

/* ------------------- Add Schedule ------------------- */
const EditableSchedule = ({
  allSlots,
  tempSlots,
  onAddTempSlot,
  onDeleteTempSlot,
  onSave,
  loading,
}: {
  allSlots: TimeSlot[];
  tempSlots: TimeSlot[];
  onAddTempSlot: (slot: TimeSlot) => void;
  onDeleteTempSlot: (id: number) => void;
  onSave: () => void;
  loading: boolean;
}) => {
  const next7Days = getNext7Days();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStartHour, setSelectedStartHour] = useState<string | null>(null);

  const takenHours = (date: string) =>
    allSlots.filter((s) => s.date === date).map((s) => s.startTime);

  const handleAddSlot = () => {
    if (!selectedDate) { toast.error("Please select a date"); return; }
    if (!selectedStartHour) { toast.error("Please select a start time"); return; }

    if (takenHours(selectedDate).includes(selectedStartHour)) {
      toast.error("This time slot is already added");
      return;
    }

    const start = new Date(`${selectedDate}T${selectedStartHour}:00`);
    if (start < new Date()) { toast.error("Cannot schedule in the past"); return; }

    onAddTempSlot({
      id: Date.now(),
      date: selectedDate,
      startTime: selectedStartHour,
      endTime: getEndTime(selectedStartHour),
      available: true,
    });

    setSelectedStartHour(null);
  };

  const taken = selectedDate ? takenHours(selectedDate) : [];

  return (
    <Card className="shadow-2xl rounded-xl h-full border-l-8 border-blue-300 flex flex-col">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center gap-2 text-blue-700 text-lg font-semibold">
          <Plus className="w-6 h-6" /> Add Schedule
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 flex flex-col gap-5 overflow-y-auto">

        {/* Guidance */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <Info className="w-5 h-5 mt-0.5 shrink-0 text-blue-500" />
          <div>
            <p className="font-semibold mb-0.5">Scheduling rules</p>
            <ul className="list-disc list-inside space-y-0.5 text-blue-700">
              <li>Only the <strong>next 7 days</strong> are available.</li>
              <li>Each slot is exactly <strong>1 hour</strong> long.</li>
              <li>Past slots and already-added slots are disabled.</li>
            </ul>
          </div>
        </div>

        {/* Step 1 */}
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4" /> Step 1 — Select a date
          </p>
          <div className="flex flex-wrap gap-2">
            {next7Days.map((d) => (
              <button
                key={d.value}
                onClick={() => { setSelectedDate(d.value); setSelectedStartHour(null); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                  ${selectedDate === d.value
                    ? "bg-blue-600 text-white border-blue-600 shadow"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"}`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 */}
        {selectedDate && (
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Step 2 — Select start time
              <span className="text-xs font-normal text-gray-400 ml-1">
                (1 hr slot, e.g. 11 PM → 12 AM)
              </span>
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {HOURS.map((h) => {
                const isTaken = taken.includes(h.value);
                const isPast = new Date(`${selectedDate}T${h.value}:00`) < new Date();
                const disabled = isTaken || isPast;
                const isSelected = selectedStartHour === h.value;

                return (
                  <button
                    key={h.value}
                    disabled={disabled}
                    onClick={() => setSelectedStartHour(isSelected ? null : h.value)}
                    className={`py-2 px-1 rounded-lg text-xs font-medium border transition-all text-center
                      ${isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                        : disabled
                        ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed line-through"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                  >
                    {h.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Preview */}
        {selectedStartHour && (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <span className="text-sm font-medium text-green-800">
              📅 {selectedDate} &nbsp;•&nbsp;{" "}
              {formatTime(selectedStartHour)} → {formatTime(getEndTime(selectedStartHour))}
            </span>
            <Button
              size="sm"
              onClick={handleAddSlot}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        )}

        {/* Pending */}
        {tempSlots.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">
              Pending slots ({tempSlots.length})
            </p>
            {tempSlots.map((slot) => (
              <div
                key={slot.id}
                className="flex justify-between items-center border border-dashed border-blue-300 bg-blue-50 p-3 rounded-lg"
              >
                <span className="text-sm text-gray-700">
                  {slot.date} &nbsp;•&nbsp; {formatTime(slot.startTime)} –{" "}
                  {formatTime(slot.endTime)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteTempSlot(slot.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Save */}
        <Button
          onClick={onSave}
          className="bg-blue-600 hover:bg-blue-700 text-white mt-auto"
          disabled={loading || tempSlots.length === 0}
        >
          {loading
            ? "Saving..."
            : `Save ${tempSlots.length > 0
                ? `${tempSlots.length} Slot${tempSlots.length > 1 ? "s" : ""}`
                : "Slots"
              }`}
        </Button>
      </CardContent>
    </Card>
  );
};

/* ------------------- Main Page ------------------- */
const Schedule = () => {
  const [doctorSchedule, setDoctorSchedule] = useState<TimeSlot[]>([]);
  const [tempSlots, setTempSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSchedule = async () => {
    try {
      const response: DoctorScheduleResponseDto = await getDoctorSchedule();
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
            new Date(`${slot.date}T${slot.startTime}`).getTime() >= Date.now()
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

  useEffect(() => { fetchSchedule(); }, []);

  const handleAddTempSlot = (slot: TimeSlot) => {
    setTempSlots((prev) => [...prev, slot]);
  };

  const handleDeleteTempSlot = (id: number) => {
    setTempSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = async () => {
    if (!tempSlots.length) { toast.error("Add at least one slot"); return; }
    try {
      setLoading(true);
      const dto: SaveDoctorScheduleDto = {
        schedules: tempSlots.map((slot) => ({
          scheduleDate: new Date(`${slot.date}T${slot.startTime}:00`).toISOString(),
          startTime: slot.startTime,
          endTime: slot.endTime,
          available: true,
        })),
      };
      await saveWeeklySchedule(dto);
      toast.success("Schedule saved successfully");
      setTempSlots([]);
      await fetchSchedule();
    } catch (error: any) {
      // ✅ Backend now returns ApiResponse JSON with "message" field
      // e.g. { status: false, message: "Slot already exists: 2026-03-22 at 19:00", data: null }
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to save schedule";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Single source of truth: server slots + pending temp slots combined
  const allSlots = [...doctorSchedule, ...tempSlots];

  return (
    <div className="h-screen w-full bg-gray-50 p-8 flex flex-col md:flex-row gap-6">
      <div className="md:w-1/2 h-full">
        <ExistingSchedule schedules={doctorSchedule} />
      </div>
      <div className="md:w-1/2 h-full">
        <EditableSchedule
          allSlots={allSlots}
          tempSlots={tempSlots}
          onAddTempSlot={handleAddTempSlot}
          onDeleteTempSlot={handleDeleteTempSlot}
          onSave={handleSave}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Schedule;