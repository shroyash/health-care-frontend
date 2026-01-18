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
} from "recharts";

import { Card } from "@/components/ui/card";
import {
  getWeeklyAppointments,
  getPatientsGenderCount,
} from "@/lib/api/adminDashboard";
import type {
  WeeklyAppointmentCountResponse,
  GenderCountResponse,
} from "@/lib/type/adminDashboard";

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
        // Weekly appointments
        const weekly: WeeklyAppointmentCountResponse[] =
          await getWeeklyAppointments();
          console.log(weekly)

        if (isMounted) {
          setWeeklyData(
            weekly.map((item) => ({
              day: item.day,
              appointments: item.count,
            }))
          );
        }

        // Gender distribution
        const gender: GenderCountResponse =
          await getPatientsGenderCount();

        if (isMounted) {
          setGenderData([
            { name: "Male Patients", value: gender.male ?? 0 },
            { name: "Female Patients", value: gender.female ?? 0 },
          ]);
        }
      } catch (error) {
        console.error("Failed to load chart data", error);
      } finally {
        if (isMounted) setLoading(false);
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
      {/* Line Chart */}
      <Card className="shadow-soft p-6">
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

      {/* Pie Chart */}
      <Card className="shadow-soft p-6">
        <h2 className="text-lg font-semibold mb-4">
          Patient Distribution
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={genderData}
              cx="50%"
              cy="50%"
              outerRadius={110}
              dataKey="value"
              label
            >
              {genderData.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
