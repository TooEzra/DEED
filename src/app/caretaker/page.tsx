import { getCaretakerDashboardStats } from "@/services/dashboard.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CaretakerDashboardPage() {
  let stats;
  try {
    stats = await getCaretakerDashboardStats();
  } catch {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        Unable to load dashboard. Ensure the database is connected.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Caretaker Dashboard</h1>
        <p className="text-slate-500 text-sm">Day-to-day operations</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Total Houses</p>
            <p className="text-2xl font-bold">{stats.totalHouses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Occupied</p>
            <p className="text-2xl font-bold text-emerald-700">
              {stats.occupiedHouses}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Vacant</p>
            <p className="text-2xl font-bold text-amber-600">
              {stats.vacantHouses}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Pending Maintenance</p>
            <p className="text-2xl font-bold text-orange-600">
              {stats.pendingMaintenance}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Maintenance Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentRequests.length === 0 ? (
              <p className="text-sm text-slate-500">No requests</p>
            ) : (
              stats.recentRequests.map((r) => (
                <div key={r.id} className="text-sm border-b border-slate-100 pb-2">
                  <div className="flex justify-between">
                    <p className="font-medium">{r.title}</p>
                    <Badge
                      variant={
                        r.status === "PENDING"
                          ? "warning"
                          : r.status === "RESOLVED"
                          ? "success"
                          : "info"
                      }
                    >
                      {r.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    {r.house.houseNumber} · {r.tenant.fullName} ·{" "}
                    {formatDate(r.createdAt)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentAnnouncements.length === 0 ? (
              <p className="text-sm text-slate-500">No announcements</p>
            ) : (
              stats.recentAnnouncements.map((a) => (
                <div key={a.id} className="text-sm">
                  <p className="font-medium">{a.title}</p>
                  <p className="text-xs text-slate-500 line-clamp-2">{a.content}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
