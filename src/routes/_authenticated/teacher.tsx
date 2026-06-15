import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/teacher")({
  component: TeacherLayout,
});

function TeacherLayout() {
  return (
    <div className="w-full">
      <Outlet />
    </div>
  );
}