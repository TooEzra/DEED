import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getTenantContext } from "@/services/tenant-portal.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TenantMaintenancePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const tenant = await getTenantContext(session.userId);
  if (!tenant) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">Tenant profile not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Maintenance</h1>
          <p className="text-sm text-slate-500">Your requests</p>
        </div>
        <Link href="/tenant/maintenance/new">
          <Button>
            <Plus className="w-4 h-4" />
            New request
          </Button>
        </Link>
      </div>
      {tenant.maintenanceRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">No maintenance requests</p>
            <Link href="/tenant/maintenance/new" className="inline-block mt-4">
              <Button>
                <Plus className="w-4 h-4" />
                New request
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tenant.maintenanceRequests.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{m.title}</p>
                    <p className="text-sm text-slate-500 mt-1">{m.description}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {m.category} · {formatDate(m.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge
                      variant={
                        m.status === "RESOLVED" || m.status === "CLOSED"
                          ? "success"
                          : m.status === "PENDING"
                          ? "warning"
                          : "info"
                      }
                    >
                      {m.status}
                    </Badge>
                    <Badge variant="secondary">{m.priority}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}