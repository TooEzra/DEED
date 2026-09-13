import { listHouses } from "@/services/house.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusVariant: Record<string, "success" | "warning" | "info" | "secondary"> = {
  OCCUPIED: "success",
  VACANT: "warning",
  MAINTENANCE: "info",
  RESERVED: "secondary",
};

export default async function CaretakerHousesPage() {
  let data;
  try {
    data = await listHouses({ page: 1, limit: 100 });
  } catch {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        Unable to load houses.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Houses</h1>
        <p className="text-sm text-slate-500">{data.total} units at THE DEED HOSTELS</p>
      </div>
      {data.items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">No houses yet</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((house) => {
            const tenant = house.tenants[0];
            return (
              <Card key={house.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{house.houseNumber}</CardTitle>
                    <Badge variant={statusVariant[house.status] || "secondary"}>{house.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-500">{house.houseType}</p>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rent</span>
                    <span className="font-semibold">{formatCurrency(Number(house.monthlyRent))}</span>
                  </div>
                  {tenant ? (
                    <p className="text-xs text-slate-500 pt-2 border-t">Tenant: {tenant.fullName}</p>
                  ) : (
                    <p className="text-xs text-slate-400 pt-2 border-t">Vacant</p>
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