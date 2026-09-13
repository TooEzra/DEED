import { listAnnouncements } from "@/services/admin-lists.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CaretakerAnnouncementsPage() {
  let items;
  try {
    items = await listAnnouncements();
  } catch {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        Unable to load announcements.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Announcements</h1>
        <p className="text-sm text-slate-500">{items.length} announcement{items.length !== 1 ? "s" : ""}</p>
      </div>
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">No announcements</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{a.title}</p>
                    <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{a.content}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {a.createdBy.fullName} · {formatDate(a.publishedAt)}
                    </p>
                  </div>
                  <Badge variant={a.isActive ? "success" : "secondary"}>
                    {a.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}