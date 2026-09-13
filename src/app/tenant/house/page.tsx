import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getTenantContext } from "@/services/tenant-portal.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TenantHousePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const tenant = await getTenantContext(session.userId);
  if (!tenant) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        Tenant profile not found.
      </div>
    );
  }

  const house = tenant.house;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My House</h1>
        <p className="text-sm text-slate-500">THE DEED HOSTELS</p>
      </div>
      {!house ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            You are not assigned to a house yet. Contact the administrator.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">House {house.houseNumber}</CardTitle>
              <Badge variant={house.status === "OCCUPIED" ? "success" : "secondary"}>
                {house.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Type</span>
              <span className="font-medium">{house.houseType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Monthly rent</span>
              <span className="font-semibold">{formatCurrency(Number(house.monthlyRent))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Deposit</span>
              <span>{formatCurrency(Number(house.depositAmount))}</span>
            </div>
            {house.description && (
              <div>
                <p className="text-slate-500">Description</p>
                <p className="mt-1">{house.description}</p>
              </div>
            )}
            {house.amenities?.length > 0 && (
              <div>
                <p className="text-slate-500 mb-1">Amenities</p>
                <div className="flex flex-wrap gap-1">
                  {house.amenities.map((a) => (
                    <Badge key={a} variant="secondary">{a}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t">
              <span className="text-slate-500">Move-in date</span>
              <span>{formatDate(tenant.moveInDate)}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}