"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Wallet,
  CreditCard,
  Banknote,
  Wrench,
  FileText,
  Megaphone,
  Bell,
  User,
  LogOut,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/tenant", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tenant/house", label: "My House", icon: Home },
  { href: "/tenant/rent", label: "My Rent", icon: Wallet },
  { href: "/tenant/payments", label: "Payments", icon: CreditCard },
  { href: "/tenant/pay", label: "Pay Rent", icon: Banknote },
  { href: "/tenant/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/tenant/lease", label: "Lease", icon: FileText },
  { href: "/tenant/announcements", label: "Announcements", icon: Megaphone },
  { href: "/tenant/notifications", label: "Notifications", icon: Bell },
  { href: "/tenant/profile", label: "Profile", icon: User },
];

export function TenantNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Top bar mobile */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 h-14 flex items-center gap-2 lg:hidden">
        <Building2 className="w-5 h-5 text-emerald-700" />
        <span className="font-semibold text-sm">THE DEED HOSTELS</span>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:fixed lg:inset-y-0 border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 px-4 py-5 border-b">
          <Building2 className="w-5 h-5 text-emerald-700" />
          <span className="font-semibold text-sm">THE DEED HOSTELS</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {items.map((item) => {
            const active =
              item.href === "/tenant"
                ? pathname === "/tenant"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-emerald-50 text-emerald-800"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Bottom nav mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 flex justify-around py-2">
        {items.slice(0, 5).map((item) => {
          const active =
            item.href === "/tenant"
              ? pathname === "/tenant"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-xs",
                active ? "text-emerald-700" : "text-slate-500"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="truncate max-w-[56px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
