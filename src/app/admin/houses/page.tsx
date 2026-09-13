import { listHouses } from "@/services/house.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

const statusVariant: Record<
  string,
  "success" | "warning" | "info" | "secondary" | "destructive"
> = {
  OCCUPIED: "success",
  VACANT: "warning",
  MAINTENANCE: "info",
  RESERVED: "secondary",
};

export default async function HousesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  let data;
  try {
    data = await listHouses({
      status: params.status as any,
      search: params.search,
      page: Number(params.page) || 1,
    });
  } catch {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        Unable to load houses. Check database connection.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Houses</h1>
          <p className="text-sm text-slate-500">
            {data.total} unit{data.total !== 1 ? "s" : ""} at THE DEED HOSTELS
          </p>
        </div>
        <Link href="/admin/houses/new">
          <Button>
            <Plus className="w-4 h-4" />
            Add House
          </Button>
        </Link>
      </div>

      {data.items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500 font-medium">No houses yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Create your first house to start managing THE DEED HOSTELS.
            </p>
            <Link href="/admin/houses/new" className="inline-block mt-4">
              <Button>
                <Plus className="w-4 h-4" />
                Add House
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((house) => {
            const tenant = house.tenants[0];
            return (
              <Card key={house.id} className="h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{house.houseNumber}</CardTitle>
                    <Badge variant={statusVariant[house.status] || "secondary"}>
                      {house.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">{house.houseType}</p>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rent</span>
                    <span className="font-semibold">
                      {formatCurrency(Number(house.monthlyRent))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Deposit</span>
                    <span>{formatCurrency(Number(house.depositAmount))}</span>
                  </div>
                  {tenant ? (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-slate-500 text-xs">Tenant</p>
                      <p className="font-medium">{tenant.fullName}</p>
                      <p className="text-xs text-slate-500">{tenant.phone}</p>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-400">No tenant assigned</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}