"use client";

import { useParams } from "next/navigation";
import Chat from "@/components/ui/Chat";

export default function AppointmentRoomPage() {
  const params = useParams();
  const appointmentId = Number(params.id);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Appointment Room #{appointmentId}</h1>
      <Chat appointmentId={appointmentId} />
    </div>
  );
}
