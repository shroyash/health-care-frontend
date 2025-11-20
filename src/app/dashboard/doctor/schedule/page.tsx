'use client'

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, Plus, Clock } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { saveWeeklySchedule } from "@/lib/api/doctorDashboard";
import { ScheduleDto, DoctorScheduleDto } from "@/lib/type/doctorDashboard";

// Local type for UI management
interface TimeSlot {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
}

interface ScheduleProps {
  doctorProfileId: number; // Must pass from parent
}

const Schedule = ({ doctorProfileId }: ScheduleProps) => {
  const [schedules, setSchedules] = useState<TimeSlot[]>([]);
  const [newSlot, setNewSlot] = useState({ day: "", startTime: "", endTime: "" });

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleAddSlot = () => {
    if (!newSlot.day || !newSlot.startTime || !newSlot.endTime) {
      toast.error("Please fill in all fields");
      return;
    }

    const newSchedule: TimeSlot = {
      id: Date.now(),
      ...newSlot
    };

    setSchedules([...schedules, newSchedule]);
    setNewSlot({ day: "", startTime: "", endTime: "" });
    toast.success("Time slot added locally");
  };

  const handleDeleteSlot = (id: number) => {
    setSchedules(schedules.filter(slot => slot.id !== id));
    toast.info("Time slot removed locally");
  };

  const handleSaveToServer = async () => {
    if (schedules.length === 0) {
      toast.error("Add at least one time slot before saving");
      return;
    }

    try {
      // Map local TimeSlot to ScheduleDto
      const scheduleDtoArray: ScheduleDto[] = schedules.map(slot => ({
        dayOfWeek: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        available: true
      }));

      const dto: DoctorScheduleDto = {
        schedules: scheduleDtoArray
      };

      await saveWeeklySchedule(dto);
      toast.success("Weekly schedule saved to server");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save schedule to server");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Schedule */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add New Time Slot</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="day">Day of Week</Label>
              <Select
                value={newSlot.day}
                onValueChange={value => setNewSlot({ ...newSlot, day: value })}
              >
                <SelectTrigger className="medical-input">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map(day => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={newSlot.startTime}
                onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })}
                className="medical-input"
              />
            </div>

            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={newSlot.endTime}
                onChange={e => setNewSlot({ ...newSlot, endTime: e.target.value })}
                className="medical-input"
              />
            </div>
          </div>

          <Button onClick={handleAddSlot} className="medical-button mt-2">
            <Plus className="w-4 h-4 mr-2" />
            Add Time Slot
          </Button>

          <Button onClick={handleSaveToServer} className="medical-button mt-4">
            Save Weekly Schedule
          </Button>
        </CardContent>
      </Card>

      {/* Current Schedules */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Your Weekly Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {schedules.length > 0 ? (
              schedules.map(slot => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-[var(--transition-smooth)]"
                >
                  <div className="flex items-center space-x-4">
                    <Badge className="status-approved">{slot.day}</Badge>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{slot.startTime} - {slot.endTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteSlot(slot.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No schedules added yet. Create your first time slot above.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Schedule;
