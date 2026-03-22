"use client";
import { useEffect, useState } from "react";
import { reportApi } from "@/lib/api/reportApi";
import type { ReportResponseDto } from "@/lib/type/report";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ReportListLayout } from "@/components/ui/Reportshared";

export default function PatientReportsPage() {
  const { userId, ready } = useCurrentUser();

  const [reports, setReports] = useState<ReportResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    // wait until ready AND userId is a non-empty string
    if (!ready || !userId || userId.trim() === "") return;
    fetchReports();
  }, [ready, userId]);

  const fetchReports = async () => {
    if (!userId || userId.trim() === "") return;
    setLoading(true);
    setError(null);
    try {
      // GET /reports/patient/{patientId}  — userId is a UUID string, no Number() needed
      const data = await reportApi.getByPatient(userId);
      setReports(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReportListLayout
      heading="My Medical Reports"
      subheading="Reports written by your doctors after consultations"
      reports={reports}
      loading={loading}
      error={error}
      onRetry={fetchReports}
      // Patient's view — show doctor ID so patient knows who wrote it
      idLabel="Doctor Name"
      getId={(r) => r.doctorName || r.doctorId}
    />
  );
}