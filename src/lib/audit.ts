import { prisma } from "@/lib/db/prisma";
import { headers } from "next/headers";

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
        oldValues: params.oldValues ?? undefined,
        newValues: params.newValues ?? undefined,
        ipAddress: ip,
        userAgent,
      },
    });
  } catch (error) {
    // Never fail the main operation because of audit logging
    console.error("Failed to create audit log:", error);
  }
}
