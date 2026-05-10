import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, LayoutDashboard, BookOpen, Receipt, ClipboardList,
  Users, Library, BookMarked, LogOut, UserCog,
} from "lucide-react";
import { useAuth, ROLE } from "@/lib/auth-context";

type Item = { title: string; url: string; icon: React.ComponentType<{ className?: string }> };

const studentItems: Item[] = [
  { title: "Dashboard", url: "/student", icon: LayoutDashboard },
  { title: "Course Registration", url: "/student/registration", icon: BookOpen },
  { title: "Fee Payment", url: "/student/fees", icon: Receipt },
  { title: "Semester Records", url: "/student/records", icon: ClipboardList },
];

const adminItems: Item[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Course Catalog", url: "/admin/courses", icon: Library },
  { title: "Teacher Assignment", url: "/admin/assignments", icon: UserCog },
  { title: "Master Records", url: "/admin/records", icon: Users },
];

const teacherItems: Item[] = [
  { title: "Dashboard", url: "/teacher", icon: LayoutDashboard },
  { title: "Assigned Courses", url: "/teacher/courses", icon: BookMarked },
];

export function AppSidebar() {
  const { appUser, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const items =
    appUser?.role_id === ROLE.ADMIN ? adminItems :
    appUser?.role_id === ROLE.TEACHER ? teacherItems :
    studentItems;

  const roleLabel =
    appUser?.role_id === ROLE.ADMIN ? "Administrator" :
    appUser?.role_id === ROLE.TEACHER ? "Teacher" : "Student";

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold leading-none">UniPortal</span>
            <span className="text-xs text-muted-foreground mt-1">{roleLabel}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname === item.url || pathname.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <div className="flex flex-col gap-2 group-data-[collapsible=icon]:items-center">
          <div className="px-2 text-xs text-muted-foreground truncate group-data-[collapsible=icon]:hidden">
            {appUser ? `${appUser.first_name} ${appUser.last_name}` : ""}
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="justify-start">
            <LogOut className="h-4 w-4" />
            <span className="group-data-[collapsible=icon]:hidden ml-2">Sign out</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}