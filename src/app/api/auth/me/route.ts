import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      phone: true,
      fullName: true,
      role: true,
      status: true,
      lastLoginAt: true,
      tenant: {
        select: {
          id: true,
          houseId: true,
          balance: true,
          house: { select: { houseNumber: true, monthlyRent: true } },
        },
      },
      caretaker: { select: { id: true } },
    },
  });

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ user });
}
