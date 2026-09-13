import { listAuditLogs } from "@/services/admin-lists.service";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  let data;
  try {
    data = await listAuditLogs({ page: 1, limit: 100 });
  } catch {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        Unable to load audit logs.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-sm text-slate-500">{data.total} action{data.total !== 1 ? "s" : ""} recorded</p>
      </div>

      {data.items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            No audit logs yet. Actions like creating houses and payments will appear here.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Entity</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">{log.user?.fullName || "System"}</td>
                    <td className="px-4 py-3 font-medium">{log.action}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {log.entityType}
                      {log.entityId ? ` · ${log.entityId.slice(0, 8)}…` : ""}
                    </td>
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