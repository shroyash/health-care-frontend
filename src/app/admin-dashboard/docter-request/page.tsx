"use client";
import { AdminLayout } from "../_components/LayoutAdmin";
import DoctorRequestLayout from "./_components/LayoutDocterReq";

export default function page() {
  return (
      <AdminLayout>
        <DoctorRequestLayout/>
      </AdminLayout>
    );

}