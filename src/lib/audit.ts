import { prisma } from "@/lib/db/prisma";
import { headers } from "next/headers";
import type { Prisma } from "@prisma/client";

interface AuditParams {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
}

export async function createAuditLog(params: AuditParams) {
  try {
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      null;
    const userAgent = headersList.get("user-agent") || null;

    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        oldValues:
          params.oldValues == null
            ? undefined
            : (JSON.parse(JSON.stringify(params.oldValues)) as Prisma.InputJsonValue),
        newValues:
          params.newValues == null
            ? undefined
            : (JSON.parse(JSON.stringify(params.newValues)) as Prisma.InputJsonValue),
        ipAddress: ip,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}