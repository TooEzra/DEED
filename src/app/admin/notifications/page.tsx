import { listNotifications } from "@/services/admin-lists.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  let items;
  try {
    items = await listNotifications();
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
          <CardContent className="py-12 text-center text-slate-500">
            No notifications yet. System alerts will appear here.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <Card key={n.id} className={n.isRead ? "opacity-70" : ""}>
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {n.user.fullName} · {formatDateTime(n.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
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