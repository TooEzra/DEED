import { listPayments } from "@/services/payment.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  let data;
  try {
    data = await listPayments({ page: 1, limit: 50 });
  } catch {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        Unable to load payments. Check database connection.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-sm text-slate-500">{data.total} payment{data.total !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/payments/new">
          <Button>
            <Plus className="w-4 h-4" />
            Record Payment
          </Button>
        </Link>
      </div>

      {data.items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500 font-medium">No payments yet</p>
            <p className="text-sm text-slate-400 mt-1">Record a cash, bank or M-Pesa payment.</p>
            <Link href="/admin/payments/new" className="inline-block mt-4">
              <Button><Plus className="w-4 h-4" /> Record Payment</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Tenant</th>
                  <th className="px-4 py-3 font-medium">House</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">{formatDate(p.paymentDate)}</td>
                    <td className="px-4 py-3 font-medium">{p.tenant.fullName}</td>
                    <td className="px-4 py-3">{p.house.houseNumber}</td>
                    <td className="px-4 py-3">{p.paymentType}</td>
                    <td className="px-4 py-3">{p.paymentMethod}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">
                      {formatCurrency(Number(p.amount))}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          p.status === "COMPLETED"
                            ? "success"
                            : p.status === "PENDING"
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{p.receiptNumber || "—"}</td>
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