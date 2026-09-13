import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { listExpenses, createExpense } from "@/services/admin-lists.service";
import { expenseCreateSchema } from "@/lib/validation/schemas";
import { Role } from "@prisma/client";
import { createAuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    await requireRole([Role.ADMIN]);
    const page = Number(req.nextUrl.searchParams.get("page")) || 1;
    const data = await listExpenses({ page });
    return NextResponse.json(data);
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to load expenses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole([Role.ADMIN]);
    const body = await req.json();
    const parsed = expenseCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }
    const expense = await createExpense(parsed.data, session.userId);
    await createAuditLog({
      userId: session.userId,
      action: "EXPENSE_CREATED",
      entityType: "Expense",
      entityId: expense.id,
      newValues: parsed.data as any,
    });
    return NextResponse.json(expense, { status: 201 });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error(e);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}