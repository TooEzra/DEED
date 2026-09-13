"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TenantOption {
  id: string;
  fullName: string;
  phone: string;
  houseId: string | null;
  house?: { id: string; houseNumber: string; monthlyRent: number | string } | null;
}

export default function NewPaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [form, setForm] = useState({
    tenantId: "",
    houseId: "",
    amount: "",
    paymentType: "RENT",
    paymentMethod: "CASH",
    transactionReference: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  useEffect(() => {
    fetch("/api/tenants?status=ACTIVE&limit=100")
      .then((r) => r.json())
      .then((d) => {
        if (d.items) setTenants(d.items);
      })
      .catch(() => {});
  }, []);

  function onTenantChange(tenantId: string) {
    const t = tenants.find((x) => x.id === tenantId);
    setForm((p) => ({
      ...p,
      tenantId,
      houseId: t?.house?.id || t?.houseId || "",
      amount: t?.house ? String(Number(t.house.monthlyRent)) : p.amount,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!form.tenantId || !form.houseId) {
      setError("Select a tenant who is assigned to a house.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: form.tenantId,
          houseId: form.houseId,
          amount: Number(form.amount),
          paymentType: form.paymentType,
          paymentMethod: form.paymentMethod,
          transactionReference: form.transactionReference || undefined,
          paymentDate: form.paymentDate,
          notes: form.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to record payment");
        setLoading(false);
        return;
      }
      router.push("/admin/payments");
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/payments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Record Payment</h1>
          <p className="text-sm text-slate-500">Cash, bank or other payment</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label>Tenant *</Label>
              <select
                value={form.tenantId}
                onChange={(e) => onTenantChange(e.target.value)}
                required
                disabled={loading}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="">Select tenant</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName}{" "}
                    {t.house ? `(${t.house.houseNumber})` : "(no house)"}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (KES) *</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, amount: e.target.value }))
                  }
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={form.paymentDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, paymentDate: e.target.value }))
                  }
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <select
                  value={form.paymentType}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, paymentType: e.target.value }))
                  }
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                  disabled={loading}
                >
                  <option value="RENT">Rent</option>
                  <option value="DEPOSIT">Deposit</option>
                  <option value="UTILITY">Utility</option>
                  <option value="PENALTY">Penalty</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Method *</Label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, paymentMethod: e.target.value }))
                  }
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                  disabled={loading}
                >
                  <option value="CASH">Cash</option>
                  <option value="MPESA">M-Pesa</option>
                  <option value="BANK">Bank</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Transaction reference</Label>
              <Input
                value={form.transactionReference}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    transactionReference: e.target.value,
                  }))
                }
                disabled={loading}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                disabled={loading}
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Record payment"
                )}
              </Button>
              <Link href="/admin/payments">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}