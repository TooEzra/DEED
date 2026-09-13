import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getTenantContext } from "@/services/tenant-portal.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TenantProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const tenant = await getTenantContext(session.userId);
  if (!tenant) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">Tenant profile not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-slate-500">Your account details</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{tenant.fullName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Phone</span>
            <span>{tenant.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Email</span>
            <span>{tenant.email || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">House</span>
            <span>{tenant.house?.houseNumber || "Unassigned"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status</span>
            <Badge variant={tenant.status === "ACTIVE" ? "success" : "secondary"}>
              {tenant.status}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Move-in</span>
            <span>{formatDate(tenant.moveInDate)}</span>
          </div>
          {tenant.emergencyContactName && (
            <div className="pt-2 border-t">
              <p className="text-slate-500 text-xs mb-1">Emergency contact</p>
              <p>
                {tenant.emergencyContactName} · {tenant.emergencyContactPhone}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}