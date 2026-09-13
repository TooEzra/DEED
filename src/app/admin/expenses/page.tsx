import { listExpenses } from "@/services/admin-lists.service";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  let data;
  try {
    data = await listExpenses({ page: 1, limit: 50 });
  } catch {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        Unable to load expenses.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p className="text-sm text-slate-500">
            Total recorded: {formatCurrency(data.totalAmount)}
          </p>
        </div>
        <Link href="/admin/expenses/new">
          <Button>
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </Link>
      </div>

      {data.items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">No expenses recorded</p>
            <Link href="/admin/expenses/new" className="inline-block mt-4">
              <Button><Plus className="w-4 h-4" /> Add Expense</Button>
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
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Recorded by</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">{formatDate(e.expenseDate)}</td>
                    <td className="px-4 py-3">{e.category}</td>
                    <td className="px-4 py-3">{e.description}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(Number(e.amount))}</td>
                    <td className="px-4 py-3 text-slate-500">{e.recordedBy.fullName}</td>
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