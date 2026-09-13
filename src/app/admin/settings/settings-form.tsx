"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Props {
  initial: {
    name: string;
    location: string;
    phone: string;
    email: string;
    description: string;
    rentDueDay: number;
    lateFeeAmount: number;
  };
}

export function SettingsForm({ initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          location: form.location || null,
          phone: form.phone || null,
          email: form.email || null,
          description: form.description || null,
          rentDueDay: Number(form.rentDueDay),
          lateFeeAmount: Number(form.lateFeeAmount) || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
        setLoading(false);
        return;
      }
      setMessage("Settings saved successfully.");
      setLoading(false);
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Property details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          {message && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">{message}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Property name</Label>
            <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} required disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={form.location} onChange={(e) => update("location", e.target.value)} disabled={loading} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} disabled={loading} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={form.description} onChange={(e) => update("description", e.target.value)} disabled={loading} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rentDueDay">Rent due day (1–28)</Label>
              <Input id="rentDueDay" type="number" min={1} max={28} value={form.rentDueDay} onChange={(e) => update("rentDueDay", e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lateFeeAmount">Late fee (KES)</Label>
              <Input id="lateFeeAmount" type="number" min={0} value={form.lateFeeAmount} onChange={(e) => update("lateFeeAmount", e.target.value)} disabled={loading} />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}