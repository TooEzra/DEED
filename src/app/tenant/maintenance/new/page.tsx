"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CATEGORIES = ["PLUMBING", "ELECTRICAL", "SECURITY", "CLEANING", "STRUCTURAL", "WATER", "OTHER"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function NewMaintenancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "OTHER",
    priority: "MEDIUM",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tenant/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit request");
        setLoading(false);
        return;
      }
      router.push("/tenant/maintenance");
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Link href="/tenant/maintenance">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New request</h1>
          <p className="text-sm text-slate-500">Report a maintenance issue</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                required
                disabled={loading}
                placeholder="e.g. Leaking pipe"
              />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                required
                disabled={loading}
                rows={4}
                className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                placeholder="Describe the problem..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                  disabled={loading}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                  disabled={loading}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit request"
                )}
              </Button>
              <Link href="/tenant/maintenance">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}