import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ROLE } from "@/lib/auth-context";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const roleId = role === "teacher" ? ROLE.TEACHER : ROLE.STUDENT;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { first_name: firstName, last_name: lastName, role_id: roleId },
      },
    });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }
    if (data.user) {
      const { error: insErr } = await supabase.from("users").insert({
        auth_user_id: data.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        role_id: roleId,
      });
      if (insErr && !insErr.message.toLowerCase().includes("duplicate")) {
        toast.error("Profile creation failed: " + insErr.message);
      }
    }
    setLoading(false);
    toast.success("Account created");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>Join the University Portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Tabs value={role} onValueChange={(v) => setRole(v as "student" | "teacher")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student">Student</TabsTrigger>
                <TabsTrigger value="teacher">Teacher</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="fn">First name</Label>
                <Input id="fn" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ln">Last name</Label>
                <Input id="ln" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Account
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}