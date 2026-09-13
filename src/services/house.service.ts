import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/audit";
import { HouseStatus, Prisma } from "@prisma/client";

export async function createHouse(
  data: {
    houseNumber: string;
    houseType: string;
    monthlyRent: number;
    depositAmount: number;
    status?: HouseStatus;
    description?: string;
    amenities?: string[];
  },
  userId: string
) {
  const existing = await prisma.house.findUnique({
    where: { houseNumber: data.houseNumber },
  });
  if (existing) {
    throw new Error("House number already exists");
  }

  const house = await prisma.house.create({
    data: {
      houseNumber: data.houseNumber,
      houseType: data.houseType,
      monthlyRent: data.monthlyRent,
      depositAmount: data.depositAmount,
      status: data.status || HouseStatus.VACANT,
      description: data.description,
      amenities: data.amenities || [],
    },
  });

  await createAuditLog({
    userId,
    action: "HOUSE_CREATED",
    entityType: "House",
    entityId: house.id,
    newValues: data as unknown as Record<string, unknown>,
  });

  return house;
}

export async function updateHouse(
  id: string,
  data: Partial<{
    houseNumber: string;
    houseType: string;
    monthlyRent: number;
    depositAmount: number;
    status: HouseStatus;
    description: string;
    amenities: string[];
    isActive: boolean;
  }>,
  userId: string
) {
  const existing = await prisma.house.findUnique({ where: { id } });
  if (!existing) throw new Error("House not found");

  if (data.houseNumber && data.houseNumber !== existing.houseNumber) {
    const conflict = await prisma.house.findUnique({
      where: { houseNumber: data.houseNumber },
    });
    if (conflict) throw new Error("House number already exists");
  }

  const house = await prisma.house.update({
    where: { id },
    data,
  });

  await createAuditLog({
    userId,
    action: "HOUSE_UPDATED",
    entityType: "House",
    entityId: id,
    oldValues: {
      houseNumber: existing.houseNumber,
      monthlyRent: Number(existing.monthlyRent),
      status: existing.status,
    },
    newValues: data as unknown as Record<string, unknown>,
  });

  return house;
}

export async function assignTenantToHouse(params: {
  houseId: string;
  tenantId: string;
  moveInDate: Date;
  userId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const house = await tx.house.findUnique({
      where: { id: params.houseId },
    });
    if (!house) throw new Error("House not found");
    if (house.status === HouseStatus.OCCUPIED) {
      throw new Error("House is already occupied");
    }

    const tenant = await tx.tenant.findUnique({
      where: { id: params.tenantId },
    });
    if (!tenant) throw new Error("Tenant not found");
    if (tenant.houseId) {
      throw new Error("Tenant is already assigned to a house");
    }

    await tx.house.update({
      where: { id: params.houseId },
      data: { status: HouseStatus.OCCUPIED },
    });

    const updated = await tx.tenant.update({
      where: { id: params.tenantId },
      data: {
        houseId: params.houseId,
        moveInDate: params.moveInDate,
        status: "ACTIVE",
        balance: Number(house.monthlyRent), // initial rent due
      },
    });

    await createAuditLog({
      userId: params.userId,
      action: "TENANT_ASSIGNED",
      entityType: "House",
      entityId: params.houseId,
      newValues: { tenantId: params.tenantId, moveInDate: params.moveInDate },
    });

    return updated;
  });
}

export async function vacateHouse(params: {
  houseId: string;
  tenantId: string;
  moveOutDate: Date;
  userId: string;
}) {
  return prisma.$transaction(async (tx) => {
    await tx.house.update({
      where: { id: params.houseId },
      data: { status: HouseStatus.VACANT },
    });

    await tx.tenant.update({
      where: { id: params.tenantId },
      data: {
        houseId: null,
        moveOutDate: params.moveOutDate,
        status: "MOVED_OUT",
      },
    });

    // Terminate active lease if any
    await tx.lease.updateMany({
      where: {
        tenantId: params.tenantId,
        houseId: params.houseId,
        status: "ACTIVE",
      },
      data: { status: "TERMINATED" },
    });

    await createAuditLog({
      userId: params.userId,
      action: "HOUSE_VACATED",
      entityType: "House",
      entityId: params.houseId,
      newValues: { tenantId: params.tenantId, moveOutDate: params.moveOutDate },
    });
  });
}

export async function listHouses(filters?: {
  status?: HouseStatus;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const where: Prisma.HouseWhereInput = { isActive: true };
  if (filters?.status) where.status = filters.status;
  if (filters?.search) {
    where.OR = [
      { houseNumber: { contains: filters.search, mode: "insensitive" } },
      { houseType: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.house.findMany({
      where,
      include: {
        tenants: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            fullName: true,
            phone: true,
            balance: true,
            moveInDate: true,
          },
          take: 1,
        },
      },
      orderBy: { houseNumber: "asc" },
      skip,
      take: limit,
    }),
    prisma.house.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getHouseById(id: string) {
  return prisma.house.findUnique({
    where: { id },
    include: {
      tenants: {
        where: { status: "ACTIVE" },
        include: {
          user: { select: { email: true } },
          leases: {
            where: { status: "ACTIVE" },
            orderBy: { startDate: "desc" },
            take: 1,
          },
        },
      },
      payments: {
        orderBy: { paymentDate: "desc" },
        take: 10,
        include: {
          tenant: { select: { fullName: true } },
        },
      },
      maintenanceRequests: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      leases: {
        orderBy: { startDate: "desc" },
        take: 5,
        include: {
          tenant: { select: { fullName: true } },
        },
      },
    },
  });
}

export async function getHouseStats() {
  const [total, occupied, vacant, maintenance, reserved] = await Promise.all([
    prisma.house.count({ where: { isActive: true } }),
    prisma.house.count({
      where: { isActive: true, status: HouseStatus.OCCUPIED },
    }),
    prisma.house.count({
      where: { isActive: true, status: HouseStatus.VACANT },
    }),
    prisma.house.count({
      where: { isActive: true, status: HouseStatus.MAINTENANCE },
    }),
    prisma.house.count({
      where: { isActive: true, status: HouseStatus.RESERVED },
    }),
  ]);

  return { total, occupied, vacant, maintenance, reserved };
}
