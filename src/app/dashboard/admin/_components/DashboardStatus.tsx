"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Calendar, TrendingUp } from "lucide-react";

interface Stat {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

const stats: Stat[] = [
  {
    title: "Total Patients",
    value: "2",
    change: "+12.5%",
    changeType: "positive",
    icon: Users,
    gradient: "bg-gradient-primary",
  },
  {
    title: "Active Doctors",
    value: "2",
    change: "+3.2%",
    changeType: "positive",
    icon: UserCheck,
    gradient: "bg-gradient-success",
  },
  {
    title: "Today's Appointments",
    value: "1",
    change: "+8.1%",
    changeType: "positive",
    icon: Calendar,
    gradient: "bg-gradient-card",
  },
  {
    title: "System Growth",
    value: "94.3%",
    change: "+2.4%",
    changeType: "positive",
    icon: TrendingUp,
    gradient: "bg-gradient-primary",
  },
];

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon; // Correct way to render dynamic component
        const changeColor =
          stat.changeType === "positive" ? "text-green-500" : "text-red-500";

        return (
          <Card
            key={stat.title}
            className="relative overflow-hidden border-0 shadow-soft hover:shadow-medium transition-all duration-300"
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 opacity-5 ${stat.gradient}`} />

            <CardHeader className="relative flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.gradient} shadow-soft`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>

            <CardContent className="relative">
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                <span className={`text-xs font-medium ${changeColor}`}>{stat.change}</span>
                <span className="text-xs text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
