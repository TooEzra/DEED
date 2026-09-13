"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Users,
  Wallet,
  Wrench,
  Megaphone,
  User,
  LogOut,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/caretaker", label: "Dashboard", icon: LayoutDashboard },
  { href: "/caretaker/houses", label: "Houses", icon: Home },
  { href: "/caretaker/tenants", label: "Tenants", icon: Users },
  { href: "/caretaker/rent", label: "Rent Status", icon: Wallet },
  { href: "/caretaker/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/caretaker/announcements", label: "Announcements", icon: Megaphone },
  { href: "/caretaker/profile", label: "Profile", icon: User },
];

export default function CaretakerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="hidden md:flex md:flex-col md:w-56 md:fixed md:inset-y-0 border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 px-4 py-5 border-b">
          <Building2 className="w-5 h-5 text-emerald-700" />
          <div>
            <p className="font-semibold text-sm">THE DEED HOSTELS</p>
            <p className="text-xs text-slate-500">Caretaker</p>
          </div>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {items.map((item) => {
            const active =
              item.href === "/caretaker"
                ? pathname === "/caretaker"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
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

      <header className="md:hidden sticky top-0 z-30 bg-white border-b px-4 h-14 flex items-center gap-2">
        <Building2 className="w-5 h-5 text-emerald-700" />
        <span className="font-semibold text-sm">THE DEED HOSTELS</span>
      </header>

      <main className="md:pl-56">
        <div className="p-4 md:p-6 max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
