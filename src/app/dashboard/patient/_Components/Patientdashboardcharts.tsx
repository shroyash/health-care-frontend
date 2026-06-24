"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { Card } from "@/components/ui/card";
import {
  getWeeklyAppointmentsByPatient,
  getPatientStatusCount,
} from "@/lib/api/patientDashboard";

import type { WeeklyAppointmentCountDto } from "@/lib/type/dashboard.types";
import type { AppointmentStatusCountDto } from "@/lib/type/appointment.types";

const STATUS_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export default function PatientDashboardCharts() {
  const [weeklyData, setWeeklyData] = useState<
    { day: string; count: number }[]
  >([]);

  const [statusData, setStatusData] = useState<
    { name: string; value: number }[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchChartsData = async () => {
      try {
        // Appointments Trend
        const weeklyRes: any = await getWeeklyAppointmentsByPatient();

        console.log("Weekly API Response:", weeklyRes);

        // Handle both shapes: API returning the array directly,
        // or API returning { status, message, data } and the array
        // being inside `.data`.
        const weekly: WeeklyAppointmentCountDto[] = Array.isArray(weeklyRes)
          ? weeklyRes
          : weeklyRes?.data ?? [];

        if (isMounted) {
          setWeeklyData(weekly);
        }

        // Appointment Status Distribution
        const statusRes: any = await getPatientStatusCount();

        console.log("Status API Response:", statusRes);

        const status: AppointmentStatusCountDto[] = Array.isArray(statusRes)
          ? statusRes
          : statusRes?.data ?? [];

        if (isMounted) {
          setStatusData(
            status.map((item) => ({
              name: item.status,
              value: item.count,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to load chart data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchChartsData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <Card className="p-6 h-[340px] animate-pulse bg-muted" />
        <Card className="p-6 h-[340px] animate-pulse bg-muted" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      {/* Appointments Trend */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          Appointments Trend
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#2563eb"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Appointment Status */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          Appointment Status
        </h2>

        {statusData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {statusData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px]">
            No status data available
          </div>
        )}
      </Card>
    </div>
  );
}