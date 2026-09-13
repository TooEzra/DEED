"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CATEGORIES = ["REPAIRS","WATER","ELECTRICITY","SECURITY","CLEANING","MAINTENANCE","SALARIES","SUPPLIES","OTHER"];

export default function NewExpensePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    category: "OTHER",
    description: "",
    amount: "",
    expenseDate: new Date().toISOString().slice(0, 10),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category,
          description: form.description,
          amount: Number(form.amount),
          expenseDate: form.expenseDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create expense");
        setLoading(false);
        return;
      }
      router.push("/admin/expenses");
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/expenses"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold">Add Expense</h1>
          <p className="text-sm text-slate-500">Record a property expense</p>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Expense details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
            <div className="space-y-2">
              <Label>Category *</Label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                disabled={loading}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required disabled={loading} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (KES) *</Label>
                <Input type="number" min="0" step="1" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} required disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input type="date" value={form.expenseDate} onChange={(e) => setForm((p) => ({ ...p, expenseDate: e.target.value }))} required disabled={loading} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save expense"}
              </Button>
              <Link href="/admin/expenses"><Button type="button" variant="outline">Cancel</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}