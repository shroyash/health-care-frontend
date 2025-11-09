

import { DashboardStats } from "./_components/DashboardStatus";
import { AppointmentsList } from "./_components/Appointments";

export default function AdminDashboardPage() {
  return (
 
      <div>
        <DashboardStats />
        <AppointmentsList />
      </div>
   
  );
}
