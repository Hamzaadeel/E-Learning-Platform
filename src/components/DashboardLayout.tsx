import { ReactNode } from "react";
import  Sidebar  from "./Sidebar";
import UserMenu from "./UserMenu";
import { User } from "../types";

interface DashboardLayoutProps {
  children: ReactNode;
  user: User;
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <Sidebar user={user} />
      <div className="flex-1 overflow-auto py-2 px-4">
        <UserMenu />
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
