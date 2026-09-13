import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getTenantContext } from "@/services/tenant-portal.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TenantLeasePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const tenant = await getTenantContext(session.userId);
  if (!tenant) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">Tenant profile not found.</div>;
  }

  const lease = tenant.leases[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lease</h1>
        <p className="text-sm text-slate-500">Your current agreement</p>
      </div>
      {!lease ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            No active lease on file. Contact the administrator.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                House {tenant.house?.houseNumber || "—"}
              </CardTitle>
              <Badge variant={lease.status === "ACTIVE" ? "success" : "secondary"}>
                {lease.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Period</span>
              <span>
                {formatDate(lease.startDate)} → {formatDate(lease.endDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Monthly rent</span>
              <span className="font-semibold">{formatCurrency(Number(lease.monthlyRent))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Deposit</span>
              <span>{formatCurrency(Number(lease.depositAmount))}</span>
            </div>
            {lease.status === "ACTIVE" && (
              <div className="flex justify-between pt-2 border-t">
                <span className="text-slate-500">Days remaining</span>
                <span className={daysUntil(lease.endDate) <= 30 ? "text-orange-600 font-medium" : ""}>
                  {daysUntil(lease.endDate)} days
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}