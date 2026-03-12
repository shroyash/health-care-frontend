"use client";
import { useState } from "react";
import { Calendar, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvailableDoctors } from "../_Components/AvailableDoctor";
import { ScheduleModal } from "../_Components/ScheduleModal";
import { CustomRequestForm } from "../_Components/CustomRequestForm";
import { DoctorWithSchedule } from "@/lib/type/patientDashboard";

export default function Page() {
  const [selectedDoctor,    setSelectedDoctor]    = useState<DoctorWithSchedule | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const handleViewSchedule = (doctor: DoctorWithSchedule) => {
    setSelectedDoctor(doctor);
    setIsScheduleModalOpen(true);
  };

  return (
    <div className="w-full h-full bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Book Appointment</h1>
          <p className="text-sm text-slate-500 mt-1">Browse available doctors or submit a custom request</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="available-slots">
          <TabsList className="mb-6">
            <TabsTrigger value="available-slots" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Available Slots
            </TabsTrigger>
            <TabsTrigger value="custom-request" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Custom Request
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available-slots">
            <AvailableDoctors onViewSchedule={handleViewSchedule} />
          </TabsContent>

          <TabsContent value="custom-request">
            <CustomRequestForm />
          </TabsContent>
        </Tabs>
      </div>

      <ScheduleModal
        doctor={selectedDoctor}
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSelectedDoctor(null);
        }}
      />
    </div>
  );
}