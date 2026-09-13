import { listCaretakers } from "@/services/admin-lists.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CaretakerPage() {
  let items;
  try {
    items = await listCaretakers();
  } catch {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        Unable to load caretakers.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Caretaker</h1>
        <p className="text-sm text-slate-500">
          {items.length} caretaker account{items.length !== 1 ? "s" : ""}
        </p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            No caretaker accounts. Seed creates one: caretaker@thedeedhostels.com
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-lg">{c.fullName}</p>
                    <p className="text-sm text-slate-500">{c.email || c.user.email}</p>
                    <p className="text-sm text-slate-500">{c.phone}</p>
                    {c.user.lastLoginAt && (
                      <p className="text-xs text-slate-400 mt-2">
                        Last login: {formatDateTime(c.user.lastLoginAt)}
                      </p>
                    )}
                  </div>
                  <Badge variant={c.status === "ACTIVE" ? "success" : "secondary"}>
                    {c.status}
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