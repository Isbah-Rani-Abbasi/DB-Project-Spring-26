import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Loader2, BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin/courses")({
  component: CourseCatalog,
});

function CourseCatalog() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form State - Bilkul aapke screenshot ke columns ke mutabiq
  const [formData, setFormData] = useState({
    course_id: null as any, 
    course_code: "",
    course_title: "",
    credit_hours: 3,
    department_id: "" as string | number, // Optional field
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("course_code", { ascending: true });

    if (error) {
      console.error("Fetch error:", error);
      alert("Courses load karne mein error aya: " + error.message);
    } else {
      setCourses(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Payload mein wohi naam hain jo aapki DB mein hain
    const payload = {
      course_code: formData.course_code,
      course_title: formData.course_title,
      credit_hours: Number(formData.credit_hours),
      department_id: formData.department_id ? Number(formData.department_id) : null,
    };

    let error;
    
    if (isEditing && formData.course_id) {
      // UPDATE COURSE
      const { error: err } = await supabase
        .from("courses")
        .update(payload as any)
        .eq("course_id", formData.course_id);
      error = err;
    } else {
      // ADD NEW COURSE
      const { error: err } = await supabase
        .from("courses")
        .insert([payload as any]);
      error = err;
    }

    if (error) {
      console.error("Submit error:", error);
      alert("Operation failed: " + error.message);
    } else {
      alert(`Course ${isEditing ? "update" : "add"} ho gaya!`);
      resetForm();
      fetchCourses();
    }
  };

  const deleteCourse = async (id: any) => {
    // 1. DELETE KARNE SE PEHLE CHECK KAREIN KE KOI STUDENT ENROLLED TOH NAHI?
    // Note: Agar aapki enrollment table ka naam 'student_courses' nahi hai, toh yahan change karein
    const { count, error: countError } = await supabase
      .from("courses") // <--- YAHAN APNI ENROLLMENT TABLE KA NAAM CHECK KAREIN
      .select("*", { count: 'exact', head: true })
      .eq("course_id", id);

    if (countError) {
      console.error("Checking enrollment error:", countError);
      // Agar table exist nahi karti toh alert dega
    }

    if (count && count > 0) {
      alert(`Delete nahi ho sakta! Is course mein abhi ${count} students enrolled hain. Pehle unko nikalna hoga.`);
      return;
    }

    // 2. AGAR KOI ENROLLED NAHI HAI, TOH DELETE KAR DEIN
    if (!window.confirm("Aap waqai is course ko delete karna chahte hain?")) return;
    
    const { error } = await supabase.from("courses").delete().eq("course_id", id);
    
    if (error) {
      alert("Delete failed: " + error.message);
    } else {
      alert("Course successfully delete ho gaya!");
      fetchCourses();
    }
  };

  const resetForm = () => {
    setFormData({ 
      course_id: null, 
      course_code: "", 
      course_title: "", 
      credit_hours: 3, 
      department_id: "" 
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6" /> Course Catalog
        </h2>
      </div>

      {/* Course Add / Update Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="text-sm font-medium mb-1 block">Course Code</label>
          <Input 
            placeholder="e.g. CS101" 
            value={formData.course_code}
            onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Course Title</label>
          <Input 
            placeholder="Introduction to CS" 
            value={formData.course_title}
            onChange={(e) => setFormData({ ...formData, course_title: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Credit Hours</label>
          <Input 
            type="number" 
            placeholder="3" 
            value={formData.credit_hours}
            onChange={(e) => setFormData({ ...formData, credit_hours: parseInt(e.target.value) || 0 })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Dept ID (Optional)</label>
          <Input 
            type="number" 
            placeholder="e.g. 1" 
            value={formData.department_id}
            onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
          />
        </div>

        <div className="flex gap-2 md:col-span-4 mt-2">
          <Button type="submit" className="flex-1">
            {isEditing ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {isEditing ? "Update Course Details" : "Add New Course"}
          </Button>
          {isEditing && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel Update
            </Button>
          )}
        </div>
      </form>

      {/* Existing Courses Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-sm">Course Code</th>
              <th className="p-4 font-semibold text-sm">Course Title</th>
              <th className="p-4 font-semibold text-sm">Credit Hours</th>
              <th className="p-4 font-semibold text-sm">Dept ID</th>
              <th className="p-4 font-semibold text-sm text-right">Manage</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-10 text-center"><Loader2 className="animate-spin h-6 w-6 mx-auto text-muted-foreground" /></td></tr>
            ) : courses.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">Koi course nahi mila. Naya course add karein!</td></tr>
            ) : courses.map((course) => (
              <tr key={course.course_id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-mono text-sm font-semibold">{course.course_code}</td>
                <td className="p-4 text-sm">{course.course_title}</td>
                <td className="p-4 text-sm">{course.credit_hours}</td>
                <td className="p-4 text-sm text-muted-foreground">{course.department_id || "-"}</td>
                <td className="p-4 text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => { 
                    setFormData({
                      course_id: course.course_id,
                      course_code: course.course_code || "",
                      course_title: course.course_title || "",
                      credit_hours: course.credit_hours || 3,
                      department_id: course.department_id || ""
                    }); 
                    setIsEditing(true); 
                  }}>
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteCourse(course.course_id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

