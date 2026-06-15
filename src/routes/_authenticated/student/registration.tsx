import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { calcFee } from "@/lib/fees";

export const Route = createFileRoute("/_authenticated/student/registration")({
  component: RegistrationPage,
});

type Offering = {
  offering_id: number;
  schedule_info: string | null;
  capacity: number | null;
  faculty_id: number | null;
  enrolled_count: number;
  course: { course_id: number; course_code: string; course_title: string; credit_hours: number } | null;
  prereq_ok: boolean;
  prereq_missing: string[];
};

function RegistrationPage() {
  const { student } = useAuth();
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<number>>(new Set());
  const [enrolledCredits, setEnrolledCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!student) return;
    setLoading(true);
    const { data: regs } = await supabase
      .from("registrations")
      .select("registration_id, offering_id, status, grade, course_offerings(course_id, courses(credit_hours))")
      .eq("student_id", student.student_id);

    const enrolled = new Set<number>();
    const passedCourses = new Set<number>();
    let credits = 0;
    regs?.forEach((r: any) => {
      if (r.status === "Enrolled") {
        enrolled.add(r.offering_id);
        credits += r.course_offerings?.courses?.credit_hours ?? 0;
      }
      if (r.grade && !["F", "W"].includes(r.grade) && r.course_offerings?.course_id) {
        passedCourses.add(r.course_offerings.course_id);
      }
    });
    setEnrolledIds(enrolled);
    setEnrolledCredits(credits);

    // FIX: Yahan filter add kiya gaya hai taake sirf student ke semester ke courses aayen
    const { data: offs } = await supabase
      .from("course_offerings")
      .select("offering_id, schedule_info, capacity, faculty_id, semester_id, courses(course_id, course_code, course_title, credit_hours)")
      .eq("semester_id", student.current_semester || 0);

    const offeringIds = (offs ?? []).map((o) => o.offering_id);
    const counts: Record<number, number> = {};
    if (offeringIds.length) {
      const { data: enrolls } = await supabase
        .from("registrations")
        .select("offering_id")
        .in("offering_id", offeringIds)
        .eq("status", "Enrolled");
      enrolls?.forEach((r: any) => { counts[r.offering_id] = (counts[r.offering_id] ?? 0) + 1; });
    }

    const courseIds = (offs ?? []).map((o: any) => o.courses?.course_id).filter(Boolean) as number[];
    const prereqMap: Record<number, { id: number; code: string }[]> = {};
    if (courseIds.length) {
      const { data: prereqs } = await supabase
        .from("prerequisites")
        .select("course_id, prerequisite_course_id")
        .in("course_id", courseIds);
      const reqIds = Array.from(new Set((prereqs ?? []).map((p: any) => p.prerequisite_course_id)));
      const codeMap: Record<number, string> = {};
      if (reqIds.length) {
        const { data: reqCourses } = await supabase
          .from("courses").select("course_id, course_code").in("course_id", reqIds);
        reqCourses?.forEach((c: any) => { codeMap[c.course_id] = c.course_code; });
      }
      (prereqs ?? []).forEach((p: any) => {
        (prereqMap[p.course_id] ||= []).push({
          id: p.prerequisite_course_id,
          code: codeMap[p.prerequisite_course_id] ?? `#${p.prerequisite_course_id}`,
        });
      });
    }

    const enriched: Offering[] = (offs ?? []).map((o: any) => {
      const courseId = o.courses?.course_id;
      const reqs = courseId ? prereqMap[courseId] ?? [] : [];
      const missing = reqs.filter((r) => !passedCourses.has(r.id)).map((r) => r.code);
      return {
        offering_id: o.offering_id,
        schedule_info: o.schedule_info,
        capacity: o.capacity,
        faculty_id: o.faculty_id,
        enrolled_count: counts[o.offering_id] ?? 0,
        course: o.courses,
        prereq_ok: missing.length === 0,
        prereq_missing: missing,
      };
    });
    setOfferings(enriched);
    setLoading(false);
  }, [student]);

  useEffect(() => { load(); }, [load]);

  const upsertVoucher = async (totalCredits: number) => {
    if (!student) return;
    const total = calcFee(totalCredits);
    const { data: existing } = await supabase
      .from("fee_vouchers")
      .select("voucher_id, status")
      .eq("student_id", student.student_id)
      .eq("status", "Unpaid")
      .order("issue_date", { ascending: false })
      .limit(1).maybeSingle();
    if (existing) {
      await supabase.from("fee_vouchers").update({ total_amount: total }).eq("voucher_id", existing.voucher_id);
    } else if (totalCredits > 0) {
      const due = new Date(); due.setDate(due.getDate() + 30);
      await supabase.from("fee_vouchers").insert({
        student_id: student.student_id,
        total_amount: total,
        due_date: due.toISOString().slice(0, 10),
        status: "Unpaid",
      });
    }
  };

  const enroll = async (o: Offering) => {
    if (!student || !o.course) return;
    if (enrolledCredits + o.course.credit_hours > student.max_credits) {
      toast.error(`Exceeds your credit limit of ${student.max_credits}`); return;
    }
    setBusy(o.offering_id);
    const { error } = await supabase.from("registrations").insert({
      student_id: student.student_id, offering_id: o.offering_id, status: "Enrolled",
    });
    if (error) { toast.error(error.message); setBusy(null); return; }
    await upsertVoucher(enrolledCredits + o.course.credit_hours);
    toast.success(`Enrolled in ${o.course.course_code}`);
    setBusy(null); load();
  };

  const drop = async (o: Offering) => {
    if (!student || !o.course) return;
    setBusy(o.offering_id);
    const { error } = await supabase
      .from("registrations").delete()
      .eq("student_id", student.student_id).eq("offering_id", o.offering_id);
    if (error) { toast.error(error.message); setBusy(null); return; }
    await upsertVoucher(Math.max(0, enrolledCredits - o.course.credit_hours));
    toast.success(`Dropped ${o.course.course_code}`);
    setBusy(null); load();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Registration</h1>
          <p className="text-muted-foreground mt-1">Enroll in available courses for this semester.</p>
        </div>
        <Card className="px-4 py-3">
          <div className="text-xs text-muted-foreground">Credits</div>
          <div className="text-xl font-semibold">{enrolledCredits} / {student?.max_credits}</div>
        </Card>
      </div>

      <div className="grid gap-3">
        {offerings.length === 0 && (
          <Card><CardContent className="py-10 text-center text-muted-foreground">No offerings available.</CardContent></Card>
        )}
        {offerings.map((o) => {
          const isEnrolled = enrolledIds.has(o.offering_id);
          const isFull = (o.capacity ?? 0) > 0 && o.enrolled_count >= (o.capacity ?? 0);
          const wouldExceed = !isEnrolled && (enrolledCredits + (o.course?.credit_hours ?? 0)) > (student?.max_credits ?? 0);
          const disabled = !isEnrolled && (!o.prereq_ok || isFull || wouldExceed);
          return (
            <Card key={o.offering_id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <CardTitle className="text-base">
                      {o.course?.course_code} — {o.course?.course_title}
                    </CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{o.course?.credit_hours} credits</Badge>
                      {o.schedule_info && <span>· {o.schedule_info}</span>}
                      <span>· Seats {o.enrolled_count}/{o.capacity ?? "∞"}</span>
                    </CardDescription>
                  </div>
                  {isEnrolled ? (
                    <Button variant="destructive" size="sm" onClick={() => drop(o)} disabled={busy === o.offering_id}>
                      {busy === o.offering_id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Drop"}
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => enroll(o)} disabled={disabled || busy === o.offering_id}>
                      {busy === o.offering_id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enroll"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              {(isEnrolled || !o.prereq_ok || isFull || wouldExceed) && (
                <CardContent className="pt-0 text-xs flex flex-wrap gap-x-4 gap-y-1">
                  {isEnrolled && <span className="text-emerald-600 inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Enrolled</span>}
                  {!o.prereq_ok && (
                    <span className="text-destructive inline-flex items-center gap-1"><XCircle className="h-3 w-3" /> Missing prerequisites: {o.prereq_missing.join(", ")}</span>
                  )}
                  {isFull && <span className="text-amber-600 inline-flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Class is full</span>}
                  {wouldExceed && <span className="text-amber-600 inline-flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Exceeds credit limit</span>}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}