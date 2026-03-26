"use client";
import { useEffect, useState } from "react";
import { reportApi } from "@/lib/api/reportApi";
import type { ReportResponseDto } from "@/lib/type/report";
import { ReportListLayout } from "@/components/ui/Reportshared";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportApi.getAll();
      setReports(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReportListLayout
      heading="All Reports"
      subheading="Every consultation report across the platform"
      reports={reports}
      loading={loading}
      error={error}
      onRetry={fetchReports}
      idLabel="Doctor Name"
      getId={(r) => r.doctorName || r.doctorId}
    />
  );
}