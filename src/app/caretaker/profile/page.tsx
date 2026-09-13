import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CaretakerProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { caretaker: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-slate-500">Your caretaker account</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{user.fullName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Phone</span>
            <span>{user.phone || user.caretaker?.phone || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Role</span>
            <Badge variant="info">{user.role}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status</span>
            <Badge variant={user.status === "ACTIVE" ? "success" : "secondary"}>{user.status}</Badge>
          </div>
          {user.lastLoginAt && (
            <div className="flex justify-between">
              <span className="text-slate-500">Last login</span>
              <span>{formatDateTime(user.lastLoginAt)}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}