import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getTenantContext } from "@/services/tenant-portal.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TenantPaymentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const tenant = await getTenantContext(session.userId);
  if (!tenant) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">Tenant profile not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-sm text-slate-500">Your payment history</p>
      </div>
      {tenant.payments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">No payments yet</CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y">
            {tenant.payments.map((p) => (
              <div key={p.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold">{formatCurrency(Number(p.amount))}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(p.paymentDate)} · {p.paymentType} · {p.paymentMethod}
                  </p>
                  {p.receiptNumber && (
                    <p className="text-xs text-slate-400">{p.receiptNumber}</p>
                  )}
                </div>
                <Badge
                  variant={
                    p.status === "COMPLETED" ? "success" : p.status === "PENDING" ? "warning" : "destructive"
                  }
                >
                  {p.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}