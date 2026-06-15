import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, UserCog, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/assignments")({
  component: TeacherAssignments,
});

function TeacherAssignments() {
  const [offerings, setOfferings] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<any>(null);
  
  // Har offering ke liye selected faculty ko store karne ke liye
  const [selectedFaculty, setSelectedFaculty] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // 1. Course Offerings fetch karein (AGAR TABLE KA NAAM DIFFERENT HAI TOH YAHAN CHANGE KAREIN)
    const { data: offeringsData } = await supabase.from("course_offerings").select("*");
    
    // 2. Courses fetch karein (Taake humein course ka naam aur code mil sakay)
    const { data: coursesData } = await supabase.from("courses").select("course_id, course_code, course_title");
    
    // 3. Faculty fetch karein (Dropdown ke liye)
    const { data: facultyData } = await supabase.from("faculty").select("*");

    if (offeringsData && coursesData) {
      // Offerings aur Courses ko aapas mein mila rahe hain UI ke liye
      const mergedData = offeringsData.map((offering) => {
        const courseInfo = coursesData.find(c => c.course_id === offering.course_id);
        return {
          ...offering,
          course_code: courseInfo?.course_code || "N/A",
          course_title: courseInfo?.course_title || "Unknown Course",
        };
      });
      
      setOfferings(mergedData);

      // Jo faculty pehle se assigned hai, usko dropdown mein set kar rahe hain
      const initialSelections: { [key: string]: any } = {};
      mergedData.forEach(item => {
        if (item.faculty_id) {
          initialSelections[item.offering_id] = item.faculty_id;
        }
      });
      setSelectedFaculty(initialSelections);
    }
    
    if (facultyData) setFacultyList(facultyData);
    
    setLoading(false);
  };

  const handleAssignTeacher = async (offeringId: any) => {
    const facId = selectedFaculty[offeringId];
    if (!facId) {
      alert("Please select a teacher first!");
      return;
    }

    setAssigningId(offeringId);

    try {
      // YAHAN DATABASE UPDATE HO RAHA HAI
      // Agar table ka naam 'course_offerings' nahi hai toh yahan bhi change karein
      const { error } = await supabase
        .from("course_offerings")
        .update({ faculty_id: facId })
        .eq("offering_id", offeringId);

      if (error) throw error;
      
      alert("Teacher successfully assigned to this course! 🎉");
    } catch (error: any) {
      console.error("Assignment error:", error);
      alert("Failed to assign teacher: " + error.message);
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <UserCog className="h-6 w-6" />
        <h2 className="text-2xl font-bold tracking-tight">Teacher Assignment</h2>
      </div>
      <p className="text-muted-foreground text-sm">
        Assign faculty members to active course offerings for this semester.
      </p>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-10 flex justify-center items-center text-muted-foreground">
            <Loader2 className="animate-spin h-6 w-6 mr-2" /> Loading data...
          </div>
        ) : offerings.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            No course offerings found.
          </div>
        ) : (
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-sm">Offering ID</th>
                <th className="p-4 font-semibold text-sm">Course Details</th>
                <th className="p-4 font-semibold text-sm">Semester ID</th>
                <th className="p-4 font-semibold text-sm">Assign Faculty</th>
                <th className="p-4 font-semibold text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {offerings.map((item) => (
                <tr key={item.offering_id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4 font-mono text-sm text-muted-foreground">#{item.offering_id}</td>
                  <td className="p-4">
                    <div className="font-medium text-sm">{item.course_title}</div>
                    <div className="text-xs text-muted-foreground">{item.course_code}</div>
                  </td>
                  <td className="p-4 text-sm">{item.semester_id}</td>
                  <td className="p-4 text-sm">
                    {/* Faculty Selection Dropdown */}
                    <select 
                      className="flex h-9 w-full sm:w-[250px] items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      value={selectedFaculty[item.offering_id] || ""}
                      onChange={(e) => setSelectedFaculty({
                        ...selectedFaculty,
                        [item.offering_id]: e.target.value
                      })}
                    >
                      <option value="" disabled>-- Select Faculty --</option>
                      {facultyList.map((f) => (
                        <option key={f.faculty_id} value={f.faculty_id}>
                          Faculty ID: {f.faculty_id} (Emp: {f.employee_id})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-sm">
                    <Button 
                      size="sm" 
                      onClick={() => handleAssignTeacher(item.offering_id)}
                      disabled={assigningId === item.offering_id || !selectedFaculty[item.offering_id]}
                      className="flex items-center gap-2"
                    >
                      {assigningId === item.offering_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Save
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}