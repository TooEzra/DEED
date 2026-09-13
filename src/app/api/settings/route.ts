import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { getPropertySettings, updatePropertySettings } from "@/services/admin-lists.service";
import { propertySettingsSchema } from "@/lib/validation/schemas";
import { Role } from "@prisma/client";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    await requireRole([Role.ADMIN]);
    const settings = await getPropertySettings();
    return NextResponse.json({ settings });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireRole([Role.ADMIN]);
    const body = await req.json();
    const parsed = propertySettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }
    const settings = await updatePropertySettings(parsed.data, session.userId);
    await createAuditLog({
      userId: session.userId,
      action: "SETTINGS_UPDATED",
      entityType: "PropertySettings",
      entityId: settings.id,
      newValues: parsed.data as any,
    });
    return NextResponse.json({ settings });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error(e);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}