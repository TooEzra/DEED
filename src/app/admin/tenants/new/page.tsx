"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HouseOption {
  id: string;
  houseNumber: string;
  houseType: string;
  monthlyRent: number | string;
  status: string;
}

export default function NewTenantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [vacantHouses, setVacantHouses] = useState<HouseOption[]>([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    nationalId: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    houseId: "",
    moveInDate: "",
  });

  useEffect(() => {
    fetch("/api/houses?status=VACANT&limit=100")
      .then((r) => r.json())
      .then((data) => {
        if (data.items) setVacantHouses(data.items);
      })
      .catch(() => {});
  }, []);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
          nationalId: form.nationalId || undefined,
          emergencyContactName: form.emergencyContactName || undefined,
          emergencyContactPhone: form.emergencyContactPhone || undefined,
          houseId: form.houseId || null,
          moveInDate: form.moveInDate || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data.error ||
          (data.details?.fieldErrors
            ? Object.values(data.details.fieldErrors).flat().join(", ")
            : "Failed to create tenant");
        setError(msg);
        setLoading(false);
        return;
      }

      router.push("/admin/tenants");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/tenants">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Tenant</h1>
          <p className="text-sm text-slate-500">
            Register a new tenant and optionally assign a house
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tenant details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full name *</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                required
                disabled={loading}
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                  disabled={loading}
                  placeholder="tenant@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  required
                  disabled={loading}
                  placeholder="+2547..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Login password *</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
                minLength={8}
                disabled={loading}
                placeholder="Min 8 characters"
              />
              <p className="text-xs text-slate-500">
                Tenant will use this to log into their portal
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationalId">National ID</Label>
              <Input
                id="nationalId"
                value={form.nationalId}
                onChange={(e) => update("nationalId", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Emergency contact name</Label>
                <Input
                  id="emergencyContactName"
                  value={form.emergencyContactName}
                  onChange={(e) => update("emergencyContactName", e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Emergency contact phone</Label>
                <Input
                  id="emergencyContactPhone"
                  value={form.emergencyContactPhone}
                  onChange={(e) => update("emergencyContactPhone", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-4">
              <p className="text-sm font-medium text-slate-700">House assignment (optional)</p>

              <div className="space-y-2">
                <Label htmlFor="houseId">Assign house</Label>
                <select
                  id="houseId"
                  value={form.houseId}
                  onChange={(e) => update("houseId", e.target.value)}
                  disabled={loading}
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  <option value="">— No house yet —</option>
                  {vacantHouses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.houseNumber} ({h.houseType}) — KES{" "}
                      {Number(h.monthlyRent).toLocaleString()}
                    </option>
                  ))}
                </select>
                {vacantHouses.length === 0 && (
                  <p className="text-xs text-amber-600">
                    No vacant houses available. Create a house first, or leave unassigned.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="moveInDate">Move-in date</Label>
                <Input
                  id="moveInDate"
                  type="date"
                  value={form.moveInDate}
                  onChange={(e) => update("moveInDate", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create tenant"
                )}
              </Button>
              <Link href="/admin/tenants">
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