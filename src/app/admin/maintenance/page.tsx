import { listMaintenance } from "@/services/admin-lists.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  let data;
  try {
    data = await listMaintenance({ page: 1, limit: 50 });
  } catch {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        Unable to load maintenance requests.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Maintenance</h1>
        <p className="text-sm text-slate-500">{data.total} request{data.total !== 1 ? "s" : ""}</p>
      </div>

      {data.items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            No maintenance requests yet. Tenants can submit requests from their portal.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.items.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{m.title}</p>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{m.description}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {m.house.houseNumber} · {m.tenant.fullName} · {m.category} · {formatDate(m.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant={
                        m.priority === "URGENT" || m.priority === "HIGH"
                          ? "destructive"
                          : m.priority === "MEDIUM"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {m.priority}
                    </Badge>
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