import { getAdminDashboardStats } from "@/services/dashboard.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Home,
  Users,
  Wallet,
  AlertTriangle,
  Wrench,
  TrendingUp,
  Building,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let stats;
  try {
    stats = await getAdminDashboardStats();
  } catch (e) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <p className="font-medium">Unable to load dashboard data</p>
        <p className="text-sm mt-1">
          Ensure the database is running and seeded. Check DATABASE_URL in .env.
        </p>
      </div>
    );
  }

  const { summary, recentPayments, recentTenants, recentMaintenance, expiringLeases } =
    stats;

  const cards = [
    {
      title: "Total Houses",
      value: summary.totalHouses,
      icon: Building,
      color: "text-slate-600",
      bg: "bg-slate-100",
    },
    {
      title: "Occupied",
      value: summary.occupiedHouses,
      icon: Home,
      color: "text-emerald-700",
      bg: "bg-emerald-100",
    },
    {
      title: "Vacant",
      value: summary.vacantHouses,
      icon: Home,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      title: "Active Tenants",
      value: summary.totalTenants,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Expected Rent",
      value: formatCurrency(summary.expectedMonthlyRent),
      icon: Wallet,
      color: "text-slate-700",
      bg: "bg-slate-100",
    },
    {
      title: "Collected (Month)",
      value: formatCurrency(summary.rentCollected),
      icon: TrendingUp,
      color: "text-emerald-700",
      bg: "bg-emerald-100",
    },
    {
      title: "Outstanding",
      value: formatCurrency(summary.outstandingRent),
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      title: "Pending Maintenance",
      value: summary.pendingMaintenance,
      icon: Wrench,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Overview of THE DEED HOSTELS
        </p>
      </div>

      {/* Alerts */}
      {(summary.tenantsWithOutstanding > 0 ||
        summary.pendingMaintenance > 0 ||
        summary.expiringLeasesCount > 0 ||
        summary.vacantHouses > 0) && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {summary.tenantsWithOutstanding > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              🔴 {summary.tenantsWithOutstanding} tenant
              {summary.tenantsWithOutstanding > 1 ? "s have" : " has"} outstanding
              rent
            </div>
          )}
          {summary.pendingMaintenance > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              🟡 {summary.pendingMaintenance} maintenance request
              {summary.pendingMaintenance > 1 ? "s are" : " is"} pending
            </div>
          )}
          {summary.expiringLeasesCount > 0 && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
              🟠 {summary.expiringLeasesCount} lease
              {summary.expiringLeasesCount > 1 ? "s expire" : " expires"} within
              30 days
            </div>
          )}
          {summary.vacantHouses > 0 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              🔵 {summary.vacantHouses} house
              {summary.vacantHouses > 1 ? "s are" : " is"} currently vacant
            </div>
          )}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{card.title}</p>
                  <p className="text-2xl font-bold mt-1 text-slate-900">
                    {card.value}
                  </p>
                </div>
                <div className={`rounded-lg p-2 ${card.bg}`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Occupancy + Net Income */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Occupancy Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-700">
              {summary.occupancyRate}%
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {summary.occupiedHouses} of {summary.totalHouses} houses occupied
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {formatCurrency(summary.totalExpenses)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Net Income (Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-3xl font-bold ${
                summary.netIncome >= 0 ? "text-emerald-700" : "text-red-600"
              }`}
            >
              {formatCurrency(summary.netIncome)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPayments.length === 0 ? (
              <p className="text-sm text-slate-500">No payments yet</p>
            ) : (
              recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="font-medium">{p.tenant.fullName}</p>
                    <p className="text-slate-500 text-xs">
                      {p.house.houseNumber} · {formatDate(p.paymentDate)}
                    </p>
                  </div>
                  <span className="font-semibold text-emerald-700">
                    {formatCurrency(Number(p.amount))}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Tenants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTenants.length === 0 ? (
              <p className="text-sm text-slate-500">No tenants yet</p>
            ) : (
              recentTenants.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="font-medium">{t.fullName}</p>
                    <p className="text-slate-500 text-xs">
                      {t.house?.houseNumber || "Unassigned"}
                    </p>
                  </div>
                  <Badge
                    variant={
                      t.status === "ACTIVE" ? "success" : "secondary"
                    }
                  >
                    {t.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Maintenance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentMaintenance.length === 0 ? (
              <p className="text-sm text-slate-500">No requests</p>
            ) : (
              recentMaintenance.map((m) => (
                <div key={m.id} className="text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{m.title}</p>
                    <Badge
                      variant={
                        m.status === "PENDING"
                          ? "warning"
                          : m.status === "RESOLVED"
                          ? "success"
                          : "info"
                      }
                    >
                      {m.status}
                    </Badge>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {m.house.houseNumber} · {m.tenant.fullName}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {expiringLeases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leases Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringLeases.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between text-sm rounded-lg bg-orange-50 border border-orange-100 px-3 py-2"
                >
                  <span>
                    {l.tenant.fullName} — House {l.house.houseNumber}
                  </span>
                  <span className="text-orange-700 font-medium">
                    Expires {formatDate(l.endDate)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
