"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", content: "", target: "ALL_TENANTS" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create");
        setLoading(false);
        return;
      }
      router.push("/admin/announcements");
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/announcements"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold">New Announcement</h1>
          <p className="text-sm text-slate-500">Notify tenants about property updates</p>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Announcement</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label>Content *</Label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                required
                disabled={loading}
                rows={5}
                className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              />
            </div>
            <div className="space-y-2">
              <Label>Target</Label>
              <select
                value={form.target}
                onChange={(e) => setForm((p) => ({ ...p, target: e.target.value }))}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                disabled={loading}
              >
                <option value="ALL_TENANTS">All tenants</option>
                <option value="ALL_USERS">All users</option>
                <option value="CARETAKERS">Caretakers only</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</> : "Publish"}
              </Button>
              <Link href="/admin/announcements"><Button type="button" variant="outline">Cancel</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}