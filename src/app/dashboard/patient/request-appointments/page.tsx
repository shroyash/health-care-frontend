"use client";

import { useState } from "react";
import { Calendar, Clock, Stethoscope } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvailableDoctors } from "../_Components/AvailableDoctor";
import { ScheduleModal } from "../_Components/ScheduleModal";
import { CustomRequestForm } from "../_Components/CustomRequestForm";

import { DoctorWithSchedule } from "@/lib/type/patientDashboard";

export default function Page() {
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithSchedule | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const handleViewSchedule = (doctor: DoctorWithSchedule) => {
    setSelectedDoctor(doctor);
    setIsScheduleModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">

      {/* HEADER */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Patient Dashboard</h1>
              <p className="text-sm text-muted-foreground">Book appointments</p>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="available-slots">

          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="available-slots">
              <Calendar className="h-4 w-4 mr-2" />
              Available Slots
            </TabsTrigger>

            <TabsTrigger value="custom-request">
              <Clock className="h-4 w-4 mr-2" />
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
      </main>

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
