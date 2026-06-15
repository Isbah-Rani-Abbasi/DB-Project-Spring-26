import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Users, GraduationCap, BookOpen, Wallet, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [coursesCount, setCoursesCount] = useState(0);

 
  const stats = {
    students: 173,
    faculty: 35,
    paidAmount: "850,000",
    unpaidAmount: "120,000",
  };

  useEffect(() => {
    fetchActiveCourses();
  }, []);

  const fetchActiveCourses = async () => {
    // Courses table se total count nikal rahe hain
    const { count, error } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true });

    if (!error && count !== null) {
      setCoursesCount(count);
    }
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here is the overview of your university portal.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Students Card */}
        <div className="rounded-xl border bg-white text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between">
            <h3 className="tracking-tight text-sm font-medium">Total Students</h3>
            <GraduationCap className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">{stats.students}</div>
          <p className="text-xs text-muted-foreground">
            +12 enrolled this semester
          </p>
        </div>

        {/* Total Faculty Card */}
        <div className="rounded-xl border bg-white text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between">
            <h3 className="tracking-tight text-sm font-medium">Faculty Members</h3>
            <Users className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold">{stats.faculty}</div>
          <p className="text-xs text-muted-foreground">
            Across all departments
          </p>
        </div>

        {/* Active Courses Card (REAL DATA) */}
        <div className="rounded-xl border bg-white text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between">
            <h3 className="tracking-tight text-sm font-medium">Active Courses</h3>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold">{coursesCount}</div>
          <p className="text-xs text-muted-foreground">
            Current semester offerings
          </p>
        </div>

        {/* Revenue/Payments Card */}
        <div className="rounded-xl border bg-white text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between">
            <h3 className="tracking-tight text-sm font-medium">Fee Collection</h3>
            <Wallet className="h-4 w-4 text-orange-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold flex items-center text-emerald-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              Rs {stats.paidAmount}
            </div>
          </div>
          <div className="flex items-center text-xs text-red-500 font-medium">
            <ArrowDownRight className="h-3 w-3 mr-1" />
            Rs {stats.unpaidAmount} pending
          </div>
        </div>

      </div>

      {/* Quick Actions / Recent Activity (Optional filler for a complete look) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <div className="rounded-xl border bg-white shadow-sm lg:col-span-4 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5" />
            <h3 className="font-semibold text-lg">System Overview</h3>
          </div>
          <div className="flex items-center justify-center h-40 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
            Charts and graphs will appear here once we link real payment data.
          </div>
        </div>

        <div className="rounded-xl border bg-white shadow-sm lg:col-span-3 p-6">
          <h3 className="font-semibold text-lg mb-4">Pending Tasks</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Approve Student Registrations</span>
              <span className="text-blue-600 font-bold">5 pending</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Assign Teachers to Courses</span>
              <span className="text-red-500 font-bold">2 missing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}