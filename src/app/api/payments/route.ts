import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { createPayment } from "@/services/payment.service";
import { Role, PaymentStatus, PaymentType, PaymentMethod } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  amount: z.coerce.number().positive(),
  paymentMethod: z.enum(["MPESA", "BANK", "CASH", "OTHER"]),
  notes: z.string().optional(),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole([Role.TENANT]);
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { userId: session.userId },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant profile not found" }, { status: 404 });
    }
    if (!tenant.houseId) {
      return NextResponse.json(
        { error: "You must be assigned to a house to pay rent" },
        { status: 400 }
      );
    }

    const payment = await createPayment({
      tenantId: tenant.id,
      houseId: tenant.houseId,
      amount: parsed.data.amount,
      paymentType: PaymentType.RENT,
      paymentMethod: parsed.data.paymentMethod as PaymentMethod,
      recordedById: session.userId,
      status: PaymentStatus.COMPLETED,
      paymentDate: new Date(),
      notes:
        parsed.data.notes ||
        (parsed.data.paymentMethod === "MPESA"
          ? `Tenant self-service · ${parsed.data.phone || ""}`
          : "Tenant self-service payment"),
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e.message === "FORBIDDEN")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error(e);
    return NextResponse.json(
      { error: e.message || "Failed to record payment" },
      { status: 500 }
    );
  }
}