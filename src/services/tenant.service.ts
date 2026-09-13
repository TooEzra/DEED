import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createAuditLog } from "@/lib/audit";
import { Prisma, Role, TenantStatus, UserStatus } from "@prisma/client";

export async function createTenant(
  data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    nationalId?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    houseId?: string | null;
    moveInDate?: Date;
  },
  adminUserId: string
) {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { phone: data.phone }],
    },
  });
  if (existingUser) {
    throw new Error("A user with this email or phone already exists");
  }

  const passwordHash = await hashPassword(data.password);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: Role.TENANT,
        status: UserStatus.ACTIVE,
        fullName: data.fullName,
      },
    });

    const tenant = await tx.tenant.create({
      data: {
        userId: user.id,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        nationalId: data.nationalId,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        houseId: data.houseId || null,
        moveInDate: data.moveInDate,
        status: TenantStatus.ACTIVE,
      },
    });

    if (data.houseId) {
      const house = await tx.house.findUnique({ where: { id: data.houseId } });
      if (house && house.status === "VACANT") {
        await tx.house.update({
          where: { id: data.houseId },
          data: { status: "OCCUPIED" },
        });
        await tx.tenant.update({
          where: { id: tenant.id },
          data: { balance: Number(house.monthlyRent) },
        });
      }
    }

    return { user, tenant };
  });

  await createAuditLog({
    userId: adminUserId,
    action: "TENANT_CREATED",
    entityType: "Tenant",
    entityId: result.tenant.id,
    newValues: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
    },
  });

  return result.tenant;
}

export async function updateTenant(
  id: string,
  data: Partial<{
    fullName: string;
    phone: string;
    email: string;
    nationalId: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    status: TenantStatus;
  }>,
  adminUserId: string
) {
  const existing = await prisma.tenant.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!existing) throw new Error("Tenant not found");

  const tenant = await prisma.$transaction(async (tx) => {
    const updated = await tx.tenant.update({
      where: { id },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        nationalId: data.nationalId,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        status: data.status,
      },
    });

    // Sync user record
    const userUpdate: Prisma.UserUpdateInput = {};
    if (data.fullName) userUpdate.fullName = data.fullName;
    if (data.email) userUpdate.email = data.email;
    if (data.phone) userUpdate.phone = data.phone;
    if (data.status === TenantStatus.INACTIVE || data.status === TenantStatus.MOVED_OUT) {
      userUpdate.status = UserStatus.INACTIVE;
    } else if (data.status === TenantStatus.ACTIVE) {
      userUpdate.status = UserStatus.ACTIVE;
    }

    if (Object.keys(userUpdate).length > 0) {
      await tx.user.update({
        where: { id: existing.userId },
        data: userUpdate,
      });
    }

    return updated;
  });

  await createAuditLog({
    userId: adminUserId,
    action: "TENANT_UPDATED",
    entityType: "Tenant",
    entityId: id,
    oldValues: { fullName: existing.fullName, status: existing.status },
    newValues: data as unknown as Record<string, unknown>,
  });

  return tenant;
}

export async function listTenants(filters?: {
  status?: TenantStatus;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const where: Prisma.TenantWhereInput = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.search) {
    where.OR = [
      { fullName: { contains: filters.search, mode: "insensitive" } },
      { phone: { contains: filters.search } },
      { email: { contains: filters.search, mode: "insensitive" } },
      { nationalId: { contains: filters.search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.tenant.findMany({
      where,
      include: {
        house: { select: { id: true, houseNumber: true, monthlyRent: true } },
        user: { select: { email: true, status: true, lastLoginAt: true } },
        leases: {
          where: { status: "ACTIVE" },
          take: 1,
          orderBy: { startDate: "desc" },
        },
      },
      orderBy: { fullName: "asc" },
      skip,
      take: limit,
    }),
    prisma.tenant.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getTenantById(id: string) {
  return prisma.tenant.findUnique({
    where: { id },
    include: {
      house: true,
      user: { select: { email: true, status: true, lastLoginAt: true } },
      payments: {
        orderBy: { paymentDate: "desc" },
        take: 20,
      },
      leases: {
        orderBy: { startDate: "desc" },
      },
      maintenanceRequests: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function getTenantByUserId(userId: string) {
  return prisma.tenant.findUnique({
    where: { userId },
    include: {
      house: true,
      leases: {
        where: { status: "ACTIVE" },
        take: 1,
        orderBy: { startDate: "desc" },
      },
    },
  });
}

export async function getTenantStats() {
  const [total, active, movedOut] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { status: TenantStatus.ACTIVE } }),
    prisma.tenant.count({ where: { status: TenantStatus.MOVED_OUT } }),
  ]);
  return { total, active, movedOut };
}
