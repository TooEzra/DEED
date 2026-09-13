import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getTenantNotifications } from "@/services/tenant-portal.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TenantNotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  let items;
  try {
    items = await getTenantNotifications(session.userId);
  } catch {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        Unable to load notifications.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-sm text-slate-500">{items.length} notification{items.length !== 1 ? "s" : ""}</p>
      </div>
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">No notifications</CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <Card key={n.id} className={n.isRead ? "opacity-70" : ""}>
              <CardContent className="p-4 flex justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatDateTime(n.createdAt)}</p>
                </div>
                <div className="flex flex-col gap-1 items-end shrink-0">
                  <Badge variant="info">{n.type.replace(/_/g, " ")}</Badge>
                  {!n.isRead && <Badge variant="warning">Unread</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}