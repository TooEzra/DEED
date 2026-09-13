import { prisma } from "@/lib/db/prisma";

export async function getTenantContext(userId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { userId },
    include: {
      house: true,
      leases: {
        where: { status: "ACTIVE" },
        orderBy: { startDate: "desc" },
        take: 1,
      },
      payments: {
        orderBy: { paymentDate: "desc" },
        take: 20,
      },
      maintenanceRequests: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
  return tenant;
}

export async function getTenantAnnouncements() {
  return prisma.announcement.findMany({
    where: {
      isActive: true,
      target: { in: ["ALL_TENANTS", "ALL_USERS"] },
    },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });
}

export async function getTenantNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function createTenantMaintenance(
  userId: string,
  data: {
    title: string;
    description: string;
    category: string;
    priority?: string;
  }
) {
  const tenant = await prisma.tenant.findUnique({ where: { userId } });
  if (!tenant || !tenant.houseId) {
    throw new Error("You must be assigned to a house to submit maintenance requests");
  }
  return prisma.maintenanceRequest.create({
    data: {
      tenantId: tenant.id,
      houseId: tenant.houseId,
      title: data.title,
      description: data.description,
      category: data.category as any,
      priority: (data.priority as any) || "MEDIUM",
    },
  });
}