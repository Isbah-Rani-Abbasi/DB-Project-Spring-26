import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, GraduationCap, Users, BookOpen, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/master-records")({
  component: MasterRecords,
});

function MasterRecords() {
  const [activeTab, setActiveTab] = useState<"students" | "faculty" | "courses">("students");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setData([]); 

    let tableName = "";
    if (activeTab === "students") tableName = "students"; 
    if (activeTab === "faculty") tableName = "faculty";   
    if (activeTab === "courses") tableName = "courses";

    try {
      const { data: fetchedData, error } = await supabase
        .from(tableName as any)
        .select("*");

      if (error) {
        console.error(`${tableName} fetch error:`, error);
      } else {
        setData(fetchedData || []);
      }
    } catch (err) {
      console.log("Fetch failed");
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Database className="h-6 w-6" />
        <h2 className="text-2xl font-bold tracking-tight">Master Records</h2>
      </div>
      <p className="text-muted-foreground text-sm">
        View all centralized data across your university portal.
      </p>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 border-b pb-4">
        <Button 
          variant={activeTab === "students" ? "default" : "outline"} 
          onClick={() => setActiveTab("students")}
          className="flex gap-2"
        >
          <GraduationCap className="h-4 w-4" /> Students
        </Button>
        <Button 
          variant={activeTab === "faculty" ? "default" : "outline"} 
          onClick={() => setActiveTab("faculty")}
          className="flex gap-2"
        >
          <Users className="h-4 w-4" /> Faculty
        </Button>
        <Button 
          variant={activeTab === "courses" ? "default" : "outline"} 
          onClick={() => setActiveTab("courses")}
          className="flex gap-2"
        >
          <BookOpen className="h-4 w-4" /> Courses
        </Button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-10 flex justify-center items-center text-muted-foreground">
            <Loader2 className="animate-spin h-6 w-6 mr-2" /> Loading records...
          </div>
        ) : data.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            No records found in {activeTab} table.
          </div>
        ) : (
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 border-b">
              {activeTab === "students" && (
                <tr>
                  <th className="p-4 font-semibold text-sm">Student ID</th>
                  <th className="p-4 font-semibold text-sm">Roll Number</th>
                  <th className="p-4 font-semibold text-sm">Program ID</th>
                  <th className="p-4 font-semibold text-sm">Current Semester</th>
                  <th className="p-4 font-semibold text-sm">Enrollment Year</th>
                  <th className="p-4 font-semibold text-sm">Max Credits</th>
                </tr>
              )}
              {activeTab === "faculty" && (
                <tr>
                  <th className="p-4 font-semibold text-sm">Faculty ID</th>
                  <th className="p-4 font-semibold text-sm">Employee ID</th>
                  <th className="p-4 font-semibold text-sm">Department ID</th>
                  <th className="p-4 font-semibold text-sm">Designation</th>
                </tr>
              )}
              {activeTab === "courses" && (
                <tr>
                  <th className="p-4 font-semibold text-sm">Course ID</th>
                  <th className="p-4 font-semibold text-sm">Course Code</th>
                  <th className="p-4 font-semibold text-sm">Course Title</th>
                  <th className="p-4 font-semibold text-sm">Credit Hours</th>
                  <th className="p-4 font-semibold text-sm">Department ID</th>
                </tr>
              )}
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                  
                  {/* Students Mapping */}
                  {activeTab === "students" && (
                    <>
                      <td className="p-4 font-mono text-sm">{row.student_id}</td>
                      <td className="p-4 font-medium text-sm">{row.roll_number}</td>
                      <td className="p-4 text-sm text-muted-foreground">{row.program_id || "-"}</td>
                      <td className="p-4 text-sm">{row.current_semester || "-"}</td>
                      <td className="p-4 text-sm">{row.enrollment_year}</td>
                      <td className="p-4 text-sm">{row.max_credits}</td>
                    </>
                  )}

                  {/* Faculty Mapping */}
                  {activeTab === "faculty" && (
                    <>
                      <td className="p-4 font-mono text-sm">{row.faculty_id}</td>
                      <td className="p-4 font-medium text-sm">{row.employee_id}</td>
                      <td className="p-4 text-sm text-muted-foreground">{row.department_id || "-"}</td>
                      <td className="p-4 text-sm capitalize">{row.designation || "-"}</td>
                    </>
                  )}

                  {/* Courses Mapping */}
                  {activeTab === "courses" && (
                    <>
                      <td className="p-4 font-mono text-sm">{row.course_id}</td>
                      <td className="p-4 font-medium text-sm">{row.course_code}</td>
                      <td className="p-4 text-sm">{row.course_title}</td>
                      <td className="p-4 text-sm">{row.credit_hours}</td>
                      <td className="p-4 text-sm text-muted-foreground">{row.department_id || "-"}</td>
                    </>
                  )}
                  
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}