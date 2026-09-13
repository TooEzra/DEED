import { listLeases } from "@/services/admin-lists.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LeasesPage() {
  let data;
  try {
    data = await listLeases({ page: 1, limit: 50 });
  } catch {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        Unable to load leases.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leases</h1>
        <p className="text-sm text-slate-500">{data.total} lease{data.total !== 1 ? "s" : ""}</p>
      </div>

      {data.items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            No leases yet. Leases are created when you assign tenants to houses.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Tenant</th>
                  <th className="px-4 py-3 font-medium">House</th>
                  <th className="px-4 py-3 font-medium">Period</th>
                  <th className="px-4 py-3 font-medium">Rent</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Expiry</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((l) => {
                  const days = daysUntil(l.endDate);
                  return (
                    <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium">{l.tenant.fullName}</p>
                        <p className="text-xs text-slate-500">{l.tenant.phone}</p>
                      </td>
                      <td className="px-4 py-3">{l.house.houseNumber}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatDate(l.startDate)} → {formatDate(l.endDate)}
                      </td>
                      <td className="px-4 py-3">{formatCurrency(Number(l.monthlyRent))}</td>
                      <td className="px-4 py-3">
                        <Badge variant={l.status === "ACTIVE" ? "success" : "secondary"}>
                          {l.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {l.status === "ACTIVE" && days <= 30 && days >= 0 ? (
                          <span className="text-orange-600 font-medium text-xs">
                            ⚠️ {days} day{days !== 1 ? "s" : ""} left
                          </span>
                        ) : l.status === "ACTIVE" && days < 0 ? (
                          <span className="text-red-600 font-medium text-xs">Expired</span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}