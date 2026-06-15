import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, ROLE, roleHomePath } from "@/lib/auth-context";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/complete-profile")({
  component: CompleteProfile,
});

function CompleteProfile() {
  const { appUser } = useAuth(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // User ka role check kar rahe hain
  const isTeacher = appUser?.role_id === ROLE.TEACHER;

  // Student States
  const [rollNumber, setRollNumber] = useState("");
  const [semester, setSemester] = useState("");
  const [enrollmentYear, setEnrollmentYear] = useState(new Date().getFullYear().toString());

  // Teacher States
  const [employeeId, setEmployeeId] = useState("");
  const [designation, setDesignation] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isTeacher) {
        // Teacher ka data 'faculty' table mein jayega
        const { error } = await supabase.from("faculty").insert({
          // user_id: appUser.id, <--- IMPORTANT: Ensure your faculty table has a user_id column to link the profile!
          employee_id: employeeId,
          designation: designation,
        });
        if (error) throw error;
      } else {
        // Student ka data 'students' table mein jayega
        const { error } = await supabase.from("students").insert({
          // user_id: appUser.id, <--- IMPORTANT: Ensure your students table has a user_id column!
          roll_number: rollNumber,
          current_semester: parseInt(semester) || 1,
          enrollment_year: parseInt(enrollmentYear),
          max_credits: 18, 
        });
        if (error) throw error;
      }

      alert("Profile completed successfully!");
      // Save hone ke baad uske makhsoos dashboard par bhej do
      window.location.href = roleHomePath(appUser?.role_id);

    } catch (error: any) {
      console.error("Profile save error:", error);
      alert("Error saving profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Complete Your Profile</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {isTeacher 
              ? "Please provide your faculty employment details to continue." 
              : "Please provide your academic details to continue."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isTeacher ? (
            /* TEACHER FORM FIELDS */
            <>
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  required
                  placeholder="e.g. EMP-105"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  required
                  placeholder="e.g. Assistant Professor"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                />
              </div>
            </>
          ) : (
            /* STUDENT FORM FIELDS */
            <>
              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll Number</Label>
                <Input
                  id="rollNumber"
                  required
                  placeholder="e.g. CS-2024-001"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Current Semester</Label>
                <Input
                  id="semester"
                  type="number"
                  required
                  min="1"
                  max="8"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enrollYear">Enrollment Year</Label>
                <Input
                  id="enrollYear"
                  type="number"
                  required
                  value={enrollmentYear}
                  onChange={(e) => setEnrollmentYear(e.target.value)}
                />
              </div>
            </>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Profile & Continue
          </Button>
        </form>
      </div>
    </div>
  );
}