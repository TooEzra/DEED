import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getTenantContext } from "@/services/tenant-portal.service";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function TenantRentPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const tenant = await getTenantContext(session.userId);
  if (!tenant) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">Tenant profile not found.</div>;
  }

  const property = await prisma.propertySettings.findFirst();
  const rentDueDay = property?.rentDueDay || 5;
  const now = new Date();
  let nextDue = new Date(now.getFullYear(), now.getMonth(), rentDueDay);
  if (nextDue <= now) nextDue = new Date(now.getFullYear(), now.getMonth() + 1, rentDueDay);

  const monthlyRent = tenant.house ? Number(tenant.house.monthlyRent) : 0;
  const balance = Number(tenant.balance);
  const outstanding = Math.max(0, balance);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Rent</h1>
        <p className="text-sm text-slate-500">House {tenant.house?.houseNumber || "—"}</p>
      </div>
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardContent className="p-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Monthly rent</p>
            <p className="text-2xl font-bold">{formatCurrency(monthlyRent)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Outstanding</p>
            <p className={`text-2xl font-bold ${outstanding > 0 ? "text-red-600" : "text-emerald-700"}`}>
              {formatCurrency(outstanding)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Next due date</p>
            <p className="text-lg font-semibold">{formatDate(nextDue)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Status</p>
            <Badge variant={outstanding > 0 ? "warning" : "success"} className="mt-1">
              {outstanding > 0 ? "Balance due" : "Paid up"}
            </Badge>
          </div>
        </CardContent>
      </Card>
      {outstanding > 0 && (
        <Link href="/tenant/pay">
          <Button className="w-full">Pay Rent</Button>
        </Link>
      )}
    </div>
  );
}