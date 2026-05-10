import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, BookOpen, CreditCard, GraduationCap, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/student/")({
  component: StudentDashboard,
});

function StudentDashboard() {
  const { appUser, student } = useAuth();
  const [credits, setCredits] = useState(0);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [unpaidTotal, setUnpaidTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    (async () => {
      const { data: regs } = await supabase
        .from("registrations")
        .select("registration_id, course_offerings(courses(credit_hours))")
        .eq("student_id", student.student_id)
        .eq("status", "Enrolled");
      let total = 0;
      regs?.forEach((r: any) => { total += r.course_offerings?.courses?.credit_hours ?? 0; });
      setCredits(total);
      setEnrolledCount(regs?.length ?? 0);

      const { data: vouchers } = await supabase
        .from("fee_vouchers")
        .select("total_amount, status")
        .eq("student_id", student.student_id)
        .eq("status", "Unpaid");
      setUnpaidTotal(vouchers?.reduce((s, v) => s + Number(v.total_amount), 0) ?? 0);
      setLoading(false);
    })();
  }, [student]);

  if (!student || loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {appUser?.first_name}</h1>
        <p className="text-muted-foreground mt-1">Roll No. {student.roll_number} · Semester {student.current_semester}</p>
      </div>

      {unpaidTotal > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unpaid Fees</AlertTitle>
          <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
            <span>You have outstanding dues of <strong>Rs. {unpaidTotal.toFixed(2)}</strong>.</span>
            <Button asChild size="sm" variant="outline"><Link to="/student/fees">Pay now</Link></Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Semester</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{student.current_semester}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Credits</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{credits} <span className="text-base font-normal text-muted-foreground">/ {student.max_credits}</span></div>
            <p className="text-xs text-muted-foreground mt-1">{enrolledCount} courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Fees</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">Rs. {unpaidTotal.toFixed(2)}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Quick actions</CardTitle></CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          <Button asChild><Link to="/student/registration">Register Courses</Link></Button>
          <Button asChild variant="secondary"><Link to="/student/records">View Records</Link></Button>
          <Button asChild variant="outline"><Link to="/student/fees">Fee Vouchers</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}