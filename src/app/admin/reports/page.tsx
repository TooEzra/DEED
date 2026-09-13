import { getReportsData } from "@/services/admin-lists.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  let data;
  try {
    data = await getReportsData();
  } catch {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        Unable to load reports.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-slate-500">Current month overview for THE DEED HOSTELS</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-700">{data.occupancy.percentage}%</p>
            <p className="text-xs text-slate-500 mt-1">
              {data.occupancy.occupied} occupied · {data.occupancy.vacant} vacant · {data.occupancy.total} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Expected Rent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(data.rent.expected)}</p>
            <p className="text-xs text-slate-500 mt-1">{data.activeTenants} active tenants</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Collected (Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-700">{formatCurrency(data.rent.collected)}</p>
            <p className="text-xs text-slate-500 mt-1">
              {data.rent.collectionPercentage}% collection · {data.rent.paymentCount} payments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(data.rent.outstanding)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Expenses (Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(data.expenses.total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Net Income (Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${data.netIncome >= 0 ? "text-emerald-700" : "text-red-600"}`}>
              {formatCurrency(data.netIncome)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Payments by Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.paymentsByMethod.length === 0 ? (
              <p className="text-sm text-slate-500">No payments this month</p>
            ) : (
              data.paymentsByMethod.map((m) => (
                <div key={m.method} className="flex justify-between text-sm">
                  <span>{m.method} ({m.count})</span>
                  <span className="font-medium">{formatCurrency(m.amount)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}