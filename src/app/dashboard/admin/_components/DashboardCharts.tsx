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
  getWeeklyAppointments,
  getPatientsGenderCount,
} from "@/lib/api/adminDashboard";

import type {
  WeeklyAppointmentCountDto,
  GenderCountResponseDto,
} from "@/lib/type/dashboard.types";

const COLORS = ["#4f46e5", "#22c55e"];

export default function DashboardCharts() {
  const [weeklyData, setWeeklyData] = useState<
    { day: string; appointments: number }[]
  >([]);

  const [genderData, setGenderData] = useState<
    { name: string; value: number }[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchChartsData = async () => {
      try {
        // Weekly Appointments
        const weekly: WeeklyAppointmentCountDto[] =
          await getWeeklyAppointments();

        if (isMounted) {
          setWeeklyData(
            weekly.map((item) => ({
              day: item.day,
              appointments: item.count,
            }))
          );
        }

        // Gender Distribution
        const gender: GenderCountResponseDto[] =
          await getPatientsGenderCount();

        console.log("Gender API Response:", gender);

        if (isMounted) {
          setGenderData(
            gender.map((item) => ({
              name:
                item.gender === "MALE"
                  ? "Male Patients"
                  : "Female Patients",
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
      {/* Weekly Appointments */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          Weekly Appointments Trend
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="appointments"
              stroke="#4f46e5"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Gender Distribution */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          Patient Distribution
        </h2>

        {genderData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {genderData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px]">
            No gender data available
          </div>
        )}
      </Card>
    </div>
  );
}