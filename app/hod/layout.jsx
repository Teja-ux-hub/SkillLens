"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Trophy,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/hod" },
  { icon: Users, label: "Student Progress", href: "/hod/student-progress" },
  { icon: FolderKanban, label: "Projects", href: "/hod/projects" },
  { icon: Trophy, label: "Hackathons", href: "/hod/hackathons" },
];

export default function HODLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* HOD Header */}
      <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-slate-900/50 border-b border-white/10">
        <div className="px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-white/10"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <Link href="/hod" className="text-white font-semibold text-lg">
              SkillLens HOD
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9",
                  userButtonPopoverCard: "shadow-xl",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-56 bg-slate-900/80 backdrop-blur-lg border-r border-white/10 transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full py-6 px-3">
          <div className="mb-8 px-3">
            <h2 className="text-sm font-semibold text-white/90 mb-0.5">HOD Portal</h2>
            <p className="text-xs text-white/40">Department Management</p>
          </div>

          <nav className="flex-1 space-y-0.5">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white font-medium"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 mt-4 border-t border-white/10 px-3">
            <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">
              SkillLens HOD
            </p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-16 lg:pl-56">
        <div className="max-w-[1400px] mx-auto px-6 py-8 lg:px-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
