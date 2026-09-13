import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/schemas";
import { createAuditLog } from "@/lib/audit";
import { UserStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid credentials format", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { emailOrPhone, password } = parsed.data;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email/phone or password" },
        { status: 401 }
      );
    }

    if (user.status !== UserStatus.ACTIVE) {
      return NextResponse.json(
        { error: "Your account is inactive. Contact the administrator." },
        { status: 403 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email/phone or password" },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    await setSessionCookie(token);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await createAuditLog({
      userId: user.id,
      action: "LOGIN",
      entityType: "User",
      entityId: user.id,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
