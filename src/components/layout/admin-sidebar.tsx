"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Users,
  UserCog,
  CreditCard,
  Wrench,
  FileText,
  Receipt,
  Megaphone,
  BarChart3,
  Bell,
  ScrollText,
  Settings,
  LogOut,
  Building2,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/houses", label: "Houses", icon: Home },
  { href: "/admin/tenants", label: "Tenants", icon: Users },
  { href: "/admin/caretaker", label: "Caretaker", icon: UserCog },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/admin/leases", label: "Leases", icon: FileText },
  { href: "/admin/expenses", label: "Expenses", icon: Receipt },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-200">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-700 text-white">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-slate-900 truncate">
            THE DEED HOSTELS
          </p>
          <p className="text-xs text-slate-500">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onNavigate?.()}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-white border-b border-slate-200 px-4 h-14">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-700" />
          <span className="font-semibold text-sm">THE DEED HOSTELS</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent onNavigate={() => setMobileOpen(false)} />
      </aside>

      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r border-slate-200 bg-white">
        <NavContent />
      </aside>
    </>
  );
}