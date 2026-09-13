import { listTenants } from "@/services/tenant.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CaretakerTenantsPage() {
  let data;
  try {
    data = await listTenants({ status: "ACTIVE", page: 1, limit: 100 });
  } catch {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        Unable to load tenants.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tenants</h1>
        <p className="text-sm text-slate-500">{data.total} active tenant{data.total !== 1 ? "s" : ""}</p>
      </div>
      {data.items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">No active tenants</CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Tenant</th>
                  <th className="px-4 py-3 font-medium">House</th>
                  <th className="px-4 py-3 font-medium">Balance</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Move-in</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100">
                    <td className="px-4 py-3">
                      <p className="font-medium">{t.fullName}</p>
                      <p className="text-xs text-slate-500">{t.phone}</p>
                    </td>
                    <td className="px-4 py-3">{t.house?.houseNumber || "—"}</td>
                    <td className={`px-4 py-3 font-medium ${Number(t.balance) > 0 ? "text-red-600" : "text-emerald-700"}`}>
                      {formatCurrency(Number(t.balance))}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={t.status === "ACTIVE" ? "success" : "secondary"}>{t.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(t.moveInDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}