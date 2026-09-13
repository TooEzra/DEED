import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { listAnnouncements, createAnnouncement } from "@/services/admin-lists.service";
import { announcementCreateSchema } from "@/lib/validation/schemas";
import { Role } from "@prisma/client";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    await requireRole([Role.ADMIN, Role.CARETAKER, Role.TENANT]);
    const items = await listAnnouncements();
    return NextResponse.json({ items });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to load announcements" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole([Role.ADMIN, Role.CARETAKER]);
    const body = await req.json();
    const parsed = announcementCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }
    const item = await createAnnouncement(parsed.data, session.userId);
    await createAuditLog({
      userId: session.userId,
      action: "ANNOUNCEMENT_CREATED",
      entityType: "Announcement",
      entityId: item.id,
      newValues: { title: parsed.data.title },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error(e);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}