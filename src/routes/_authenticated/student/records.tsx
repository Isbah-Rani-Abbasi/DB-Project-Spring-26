import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/student/records")({
  component: StudentRecordsPage,
});

type RecordType = {
  registration_id: number;
  status: string;
  grade: string | null;
  course_offerings: {
    semester_id: number;
    courses: {
      course_code: string;
      course_title: string;
      credit_hours: number;
    } | null;
  } | null;
};

function StudentRecordsPage() {
  const { student } = useAuth();
  const [records, setRecords] = useState<RecordType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    (async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select(`
          registration_id,
          status,
          grade,
          course_offerings(
            semester_id,
            courses(course_code, course_title, credit_hours)
          )
        `)
        .eq("student_id", student.student_id);

      if (data) {
        setRecords(data as any);
      }
      setLoading(false);
    })();
  }, [student]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Academic Records</h1>
        <p className="text-muted-foreground mt-1">View your enrolled courses, statuses, and grades.</p>
      </div>

      {records.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No records found. You haven't registered for any courses yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {records.map((r) => {
            const course = r.course_offerings?.courses;
            const semester = r.course_offerings?.semester_id;
            
            return (
              <Card key={r.registration_id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{course?.course_code}</CardTitle>
                      <CardDescription className="mt-1">{course?.course_title}</CardDescription>
                    </div>
                    <Badge variant={r.grade ? "default" : "secondary"}>
                      {r.grade ? `Grade: ${r.grade}` : "No Grade Yet"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground flex gap-4">
                  <span>Credits: {course?.credit_hours}</span>
                  <span>Semester: {semester}</span>
                  <span>Status: <span className="font-medium text-foreground">{r.status}</span></span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}