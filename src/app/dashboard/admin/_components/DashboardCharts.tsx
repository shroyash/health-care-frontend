"use client";

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

const appointmentTrendData = [
  { day: "Mon", appointments: 12 },
  { day: "Tue", appointments: 18 },
  { day: "Wed", appointments: 10 },
  { day: "Thu", appointments: 22 },
  { day: "Fri", appointments: 15 },
  { day: "Sat", appointments: 8 },
  { day: "Sun", appointments: 5 },
];

const patientDistributionData = [
  { name: "Male Patients", value: 120 },
  { name: "Female Patients", value: 150 },
];

const COLORS = ["#4f46e5", "#22c55e"];

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      {/* Line Chart */}
      <Card className="shadow-soft p-6">
        <h2 className="text-lg font-semibold mb-4">Weekly Appointments Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={appointmentTrendData}>
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
        <h2 className="text-lg font-semibold mb-4">Patient Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={patientDistributionData}
              cx="50%"
              cy="50%"
              outerRadius={110}
              dataKey="value"
            >
              {patientDistributionData.map((_, index) => (
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
