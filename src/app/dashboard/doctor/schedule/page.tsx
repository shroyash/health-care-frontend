'use client'

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Clock, Edit2 } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  saveWeeklySchedule,
  getDoctorSchedule,
  updateDoctorSchedule,
  deleteDoctorSchedule,
} from "@/lib/api/doctorDashboard";

import {
  ScheduleDto,
  SaveDoctorScheduleDto,
  DoctorScheduleResponseDto,
} from "@/lib/type/doctorDashboard";

interface TimeSlot {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
}

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/* ------------------- Existing Schedule ------------------- */
const ExistingSchedule = ({
  schedules,
  onEdit,
  onDelete,
}: {
  schedules: TimeSlot[];
  onEdit: (slot: TimeSlot) => void;
  onDelete: (id: number) => void;
}) => {
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
                className="flex justify-between items-center border border-blue-200 p-4 rounded-xl shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <Badge className="bg-blue-200 text-blue-800">{slot.day}</Badge>
                  <span className="text-gray-700 font-medium">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(slot)}
                  >
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(slot.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
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

/* ------------------- Editable Schedule ------------------- */
const EditableSchedule = ({
  onSave,
  editSlot,
  clearEdit,
}: {
  onSave?: () => void;
  editSlot?: TimeSlot | null;
  clearEdit?: () => void;
}) => {
  const [newSlot, setNewSlot] = useState({
    day: "",
    startTime: "",
    endTime: "",
  });

  const [tempSlots, setTempSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editSlot) {
      setNewSlot({
        day: editSlot.day,
        startTime: editSlot.startTime,
        endTime: editSlot.endTime,
      });
    }
  }, [editSlot]);

  const handleAddSlot = () => {
    if (!newSlot.day || !newSlot.startTime || !newSlot.endTime) {
      toast.error("Please fill all fields");
      return;
    }

    const exists = tempSlots.some(
      (s) =>
        s.day === newSlot.day &&
        s.startTime === newSlot.startTime &&
        s.endTime === newSlot.endTime
    );

    if (exists) {
      toast.warning("This slot is already added");
      return;
    }

    setTempSlots((prev) => [
      ...prev,
      { id: Date.now(), ...newSlot },
    ]);

    setNewSlot({ day: "", startTime: "", endTime: "" });
    if (clearEdit) clearEdit();
  };

  const handleDeleteTempSlot = (id: number) => {
    setTempSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveToServer = async () => {
    if (editSlot) {
      // Update existing slot
      try {
        setLoading(true);
        await updateDoctorSchedule({
          scheduleId: editSlot.id,
          dayOfWeek: newSlot.day,
          startTime: newSlot.startTime,
          endTime: newSlot.endTime,
          available: true,
        });
        toast.success("Schedule updated successfully");
        if (onSave) onSave();
        setNewSlot({ day: "", startTime: "", endTime: "" });
        if (clearEdit) clearEdit();
      } catch (err) {
        toast.error("Failed to update schedule");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (tempSlots.length === 0) {
      toast.error("Add at least one time slot to save");
      return;
    }

    try {
      setLoading(true);
      const dto: SaveDoctorScheduleDto = {
        schedules: tempSlots.map((slot) => ({
          dayOfWeek: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          available: true,
        })),
      };
      await saveWeeklySchedule(dto);
      toast.success("All time slots saved successfully");
      setTempSlots([]);
      if (onSave) onSave();
    } catch (err) {
      toast.error("Failed to save schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-2xl rounded-xl h-full border-l-8 border-blue-300 flex flex-col">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center gap-2 text-blue-700 text-lg font-semibold">
          <Plus className="w-6 h-6" /> {editSlot ? "Edit Schedule" : "Add / Modify Schedule"}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 flex flex-col h-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label>Day</Label>
            <Select
              value={newSlot.day}
              onValueChange={(v) => setNewSlot({ ...newSlot, day: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {days.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Start Time</Label>
            <Input
              type="time"
              value={newSlot.startTime}
              onChange={(e) =>
                setNewSlot({ ...newSlot, startTime: e.target.value })
              }
            />
          </div>

          <div>
            <Label>End Time</Label>
            <Input
              type="time"
              value={newSlot.endTime}
              onChange={(e) =>
                setNewSlot({ ...newSlot, endTime: e.target.value })
              }
            />
          </div>
        </div>

        {!editSlot && (
          <Button
            onClick={handleAddSlot}
            className="bg-green-600 mb-4 w-full md:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Slot
          </Button>
        )}

        {/* TEMP SLOT LIST */}
        {!editSlot && tempSlots.length > 0 && (
          <div className="flex-1 overflow-y-auto mb-4">
            {tempSlots.map((slot) => (
              <div
                key={slot.id}
                className="flex justify-between items-center border p-4 rounded-lg mb-2 hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <Badge className="bg-blue-200 text-blue-800">{slot.day}</Badge>
                  <span className="text-gray-700 font-medium">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTempSlot(slot.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={handleSaveToServer}
          className="bg-blue-600 w-full md:w-auto mt-auto"
          disabled={loading}
        >
          {loading ? "Saving..." : editSlot ? "Update Slot" : "Save All Slots"}
        </Button>
      </CardContent>
    </Card>
  );
};

/* ------------------- Main Schedule Page ------------------- */
const Schedule = () => {
  const [doctorSchedule, setDoctorSchedule] = useState<TimeSlot[]>([]);
  const [editSlot, setEditSlot] = useState<TimeSlot | null>(null);

  const fetchSchedule = async () => {
    try {
      const response: DoctorScheduleResponseDto = await getDoctorSchedule();
      const mapped: TimeSlot[] = response.schedules.map((slot: ScheduleDto) => ({
        id: slot.scheduleId,
        day: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
      }));
      setDoctorSchedule(mapped);
    } catch (error) {
      toast.error("Failed to load schedule");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDoctorSchedule(id);
      toast.success("Schedule deleted successfully");
      fetchSchedule();
    } catch {
      toast.error("Failed to delete schedule");
    }
  };

  const handleEdit = (slot: TimeSlot) => setEditSlot(slot);
  const clearEdit = () => setEditSlot(null);

  return (
    <div className="h-screen w-full bg-gray-50 p-8 flex flex-col md:flex-row gap-6">
      <div className="md:w-1/2 h-full">
        <ExistingSchedule
          schedules={doctorSchedule}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <div className="md:w-1/2 h-full">
        <EditableSchedule
          onSave={fetchSchedule}
          editSlot={editSlot}
          clearEdit={clearEdit}
        />
      </div>
    </div>
  );
};

export default Schedule;
