import { listTenants } from "@/services/tenant.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TenantsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  let data;
  try {
    data = await listTenants({
      status: params.status as any,
      search: params.search,
      page: Number(params.page) || 1,
    });
  } catch {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        Unable to load tenants. Check database connection.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Tenants</h1>
          <p className="text-sm text-slate-500">
            {data.total} tenant{data.total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/tenants/new">
          <Button>
            <Plus className="w-4 h-4" />
            Add Tenant
          </Button>
        </Link>
      </div>

      {data.items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500 font-medium">No tenants yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Add your first tenant to get started.
            </p>
            <Link href="/admin/tenants/new" className="inline-block mt-4">
              <Button>
                <Plus className="w-4 h-4" />
                Add Tenant
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                    <th className="px-4 py-3 font-medium">Tenant</th>
                    <th className="px-4 py-3 font-medium">House</th>
                    <th className="px-4 py-3 font-medium">Rent</th>
                    <th className="px-4 py-3 font-medium">Balance</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Move-in</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">{t.fullName}</p>
                        <p className="text-xs text-slate-500">{t.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        {t.house?.houseNumber || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {t.house
                          ? formatCurrency(Number(t.house.monthlyRent))
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            Number(t.balance) > 0
                              ? "text-red-600 font-medium"
                              : "text-emerald-700"
                          }
                        >
                          {formatCurrency(Number(t.balance))}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            t.status === "ACTIVE"
                              ? "success"
                              : t.status === "MOVED_OUT"
                              ? "secondary"
                              : "warning"
                          }
                        >
                          {t.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatDate(t.moveInDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}