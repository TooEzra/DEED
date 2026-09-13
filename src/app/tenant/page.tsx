import { getSession } from "@/lib/auth/session";
import { getTenantDashboard } from "@/services/dashboard.service";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function TenantDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  let data;
  try {
    data = await getTenantDashboard(session.userId);
  } catch {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        Unable to load your dashboard. Please try again later.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        Tenant profile not found. Contact the administrator.
      </div>
    );
  }

  const { tenant, rentSummary, announcements } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Welcome, {tenant.fullName.split(" ")[0]}
        </h1>
        <p className="text-slate-500 text-sm">THE DEED HOSTELS</p>
      </div>

      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">Your House</p>
              <p className="text-2xl font-bold text-slate-900">
                {tenant.house?.houseNumber || "Not assigned"}
              </p>
            </div>
            <Badge variant={Number(tenant.balance) > 0 ? "warning" : "success"}>
              {Number(tenant.balance) > 0 ? "Balance Due" : "Paid Up"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Monthly Rent</p>
              <p className="font-semibold text-lg">
                {formatCurrency(rentSummary.monthlyRent)}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Amount Paid</p>
              <p className="font-semibold text-lg text-emerald-700">
                {formatCurrency(rentSummary.amountPaid)}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Outstanding</p>
              <p
                className={`font-semibold text-lg ${
                  rentSummary.outstanding > 0 ? "text-red-600" : "text-slate-900"
                }`}
              >
                {formatCurrency(rentSummary.outstanding)}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Next Due</p>
              <p className="font-semibold text-lg">
                {formatDate(rentSummary.nextDueDate)}
              </p>
            </div>
          </div>

          {rentSummary.outstanding > 0 && (
            <Link href="/tenant/pay" className="block mt-4">
              <Button className="w-full">Pay Rent Now</Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {tenant.leases[0] && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Current Lease</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>
              <span className="text-slate-500">Period: </span>
              {formatDate(tenant.leases[0].startDate)} →{" "}
              {formatDate(tenant.leases[0].endDate)}
            </p>
            <p>
              <span className="text-slate-500">Status: </span>
              <Badge variant="success">{tenant.leases[0].status}</Badge>
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tenant.payments.length === 0 ? (
            <p className="text-sm text-slate-500">No payments yet</p>
          ) : (
            tenant.payments.map((p) => (
              <div
                key={p.id}
                className="flex justify-between text-sm border-b border-slate-100 pb-2 last:border-0"
              >
                <div>
                  <p className="font-medium">{formatCurrency(Number(p.amount))}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(p.paymentDate)} · {p.paymentMethod}
                  </p>
                </div>
                <Badge
                  variant={
                    p.status === "COMPLETED"
                      ? "success"
                      : p.status === "PENDING"
                      ? "warning"
                      : "destructive"
                  }
                >
                  {p.status}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {announcements.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="text-sm">
                <p className="font-medium">{a.title}</p>
                <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">
                  {a.content}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
