"use client";
import { useEffect, useState } from "react";
import { reportApi } from "@/lib/api/reportApi";
import type { ReportResponseDto } from "@/lib/type/report";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ReportListLayout } from "@/components/ui/Reportshared";

export default function DoctorReportsPage() {
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
      // GET /reports/doctor/{doctorId}
      // userId is a UUID string — pass it directly, no Number() conversion needed
      const data = await reportApi.getByDoctor(userId);
      setReports(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReportListLayout
      heading="My Reports"
      subheading="All consultation reports you have created"
      reports={reports}
      loading={loading}
      error={error}
      onRetry={fetchReports}
      // Doctor's view — show patient ID on each card so doctor knows who it's for
      idLabel="Patient ID"
      getId={(r) => r.patientId}
    />
  );
}