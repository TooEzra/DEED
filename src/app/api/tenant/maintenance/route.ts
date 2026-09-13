import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { createTenantMaintenance } from "@/services/tenant-portal.service";
import { maintenanceCreateSchema } from "@/lib/validation/schemas";
import { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole([Role.TENANT]);
    const body = await req.json();
    const parsed = maintenanceCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }
    const item = await createTenantMaintenance(session.userId, parsed.data);
    return NextResponse.json(item, { status: 201 });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: e.message || "Failed to create request" }, { status: 500 });
  }
}