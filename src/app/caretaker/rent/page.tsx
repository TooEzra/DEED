import { listTenants } from "@/services/tenant.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CaretakerRentPage() {
  let data;
  try {
    data = await listTenants({ status: "ACTIVE", page: 1, limit: 100 });
  } catch {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        Unable to load rent status.
      </div>
    );
  }

  const withBalance = data.items.filter((t) => Number(t.balance) > 0);
  const paidUp = data.items.filter((t) => Number(t.balance) <= 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rent Status</h1>
        <p className="text-sm text-slate-500">
          {paidUp.length} paid up · {withBalance.length} with outstanding balance
        </p>
      </div>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-slate-500">
                <th className="px-4 py-3 font-medium">Tenant</th>
                <th className="px-4 py-3 font-medium">House</th>
                <th className="px-4 py-3 font-medium">Monthly Rent</th>
                <th className="px-4 py-3 font-medium">Balance</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((t) => {
                const bal = Number(t.balance);
                return (
                  <tr key={t.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium">{t.fullName}</td>
                    <td className="px-4 py-3">{t.house?.houseNumber || "—"}</td>
                    <td className="px-4 py-3">
                      {t.house ? formatCurrency(Number(t.house.monthlyRent)) : "—"}
                    </td>
                    <td className={`px-4 py-3 font-semibold ${bal > 0 ? "text-red-600" : "text-emerald-700"}`}>
                      {formatCurrency(bal)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={bal > 0 ? "warning" : "success"}>
                        {bal > 0 ? "Outstanding" : "Paid"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data.items.length === 0 && (
            <p className="py-12 text-center text-slate-500">No tenants</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}