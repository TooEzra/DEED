"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function TenantPayPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [hasHouse, setHasHouse] = useState(false);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("MPESA");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user?.tenant) {
          setHasHouse(!!d.user.tenant.houseId);
          const bal = Number(d.user.tenant.balance || 0);
          setBalance(bal);
          if (d.user.tenant.house?.monthlyRent) {
            setAmount(String(bal > 0 ? bal : Number(d.user.tenant.house.monthlyRent)));
          } else if (bal > 0) {
            setAmount(String(bal));
          }
        }
        if (d.user?.phone) setPhone(d.user.phone);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!hasHouse) {
      setError("You must be assigned to a house to pay rent. Contact the administrator.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/tenant/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          paymentMethod: method,
          phone: method === "MPESA" ? phone : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Payment failed");
        setLoading(false);
        return;
      }
      setSuccess("Payment recorded successfully.");
      setLoading(false);
      setTimeout(() => {
        router.push("/tenant/payments");
        router.refresh();
      }, 1000);
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h1 className="text-2xl font-bold">Pay Rent</h1>
        <p className="text-sm text-slate-500">
          {balance !== null && balance > 0
            ? `Outstanding: KES ${balance.toLocaleString()}`
            : "Enter amount to pay"}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            )}
            <div className="space-y-2">
              <Label>Amount (KES) *</Label>
              <Input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label>Method *</Label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                disabled={loading}
              >
                <option value="MPESA">M-Pesa</option>
                <option value="BANK">Bank</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
            {method === "MPESA" && (
              <div className="space-y-2">
                <Label>M-Pesa phone</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  placeholder="2547..."
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit payment"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}