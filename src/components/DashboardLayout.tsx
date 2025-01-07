import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { User } from "../types";

interface DashboardLayoutProps {
  children: ReactNode;
  user: User;
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar user={user} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
