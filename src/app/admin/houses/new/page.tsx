"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const HOUSE_TYPES = [
  "Bedsitter",
  "Single Room",
  "1 Bedroom",
  "2 Bedroom",
  "Other",
];

export default function NewHousePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    houseNumber: "",
    houseType: "Bedsitter",
    monthlyRent: "",
    depositAmount: "",
    description: "",
    amenities: "WiFi, Water, Security",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const amenities = form.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      const res = await fetch("/api/houses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          houseNumber: form.houseNumber.trim(),
          houseType: form.houseType,
          monthlyRent: Number(form.monthlyRent),
          depositAmount: Number(form.depositAmount),
          description: form.description || undefined,
          amenities,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create house");
        setLoading(false);
        return;
      }

      router.push("/admin/houses");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/houses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add House</h1>
          <p className="text-sm text-slate-500">Create a new unit at THE DEED HOSTELS</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">House details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="houseNumber">House number *</Label>
              <Input
                id="houseNumber"
                placeholder="e.g. A01"
                value={form.houseNumber}
                onChange={(e) => update("houseNumber", e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="houseType">House type *</Label>
              <select
                id="houseType"
                value={form.houseType}
                onChange={(e) => update("houseType", e.target.value)}
                disabled={loading}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                {HOUSE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyRent">Monthly rent (KES) *</Label>
                <Input
                  id="monthlyRent"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="15000"
                  value={form.monthlyRent}
                  onChange={(e) => update("monthlyRent", e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="depositAmount">Deposit (KES) *</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="15000"
                  value={form.depositAmount}
                  onChange={(e) => update("depositAmount", e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Optional notes about the unit"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amenities">Amenities (comma-separated)</Label>
              <Input
                id="amenities"
                placeholder="WiFi, Water, Security"
                value={form.amenities}
                onChange={(e) => update("amenities", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create house"
                )}
              </Button>
              <Link href="/admin/houses">
                <Button type="button" variant="outline" disabled={loading}>
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