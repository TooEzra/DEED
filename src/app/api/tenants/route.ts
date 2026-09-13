import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { listTenants, createTenant } from "@/services/tenant.service";
import { tenantCreateSchema } from "@/lib/validation/schemas";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireRole([Role.ADMIN, Role.CARETAKER]);
    const { searchParams } = req.nextUrl;
    const result = await listTenants({
      status: (searchParams.get("status") as any) || undefined,
      search: searchParams.get("search") || undefined,
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 20,
    });
    return NextResponse.json(result);
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e.message === "FORBIDDEN")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error(e);
    return NextResponse.json({ error: "Failed to load tenants" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole([Role.ADMIN]);
    const body = await req.json();
    const parsed = tenantCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const tenant = await createTenant(parsed.data, session.userId);
    return NextResponse.json(tenant, { status: 201 });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e.message === "FORBIDDEN")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (e.message?.includes("already exists"))
      return NextResponse.json({ error: e.message }, { status: 409 });
    console.error(e);
    return NextResponse.json(
      { error: e.message || "Failed to create tenant" },
      { status: 500 }
    );
  }
}