import { prisma } from "@/lib/db/prisma";
import { PaymentStatus, Prisma } from "@prisma/client";

export async function listCaretakers() {
  return prisma.caretaker.findMany({
    include: {
      user: { select: { email: true, status: true, lastLoginAt: true } },
    },
    orderBy: { fullName: "asc" },
  });
}

export async function listLeases(filters?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 50;
  const where: Prisma.LeaseWhereInput = {};
  if (filters?.status) where.status = filters.status as any;

  const [items, total] = await Promise.all([
    prisma.lease.findMany({
      where,
      include: {
        tenant: { select: { fullName: true, phone: true } },
        house: { select: { houseNumber: true } },
      },
      orderBy: { endDate: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lease.count({ where }),
  ]);
  return { items, total, page, limit };
}

export async function listMaintenance(filters?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 50;
  const where: Prisma.MaintenanceRequestWhereInput = {};
  if (filters?.status) where.status = filters.status as any;

  const [items, total] = await Promise.all([
    prisma.maintenanceRequest.findMany({
      where,
      include: {
        tenant: { select: { fullName: true, phone: true } },
        house: { select: { houseNumber: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.maintenanceRequest.count({ where }),
  ]);
  return { items, total, page, limit };
}

export async function listExpenses(filters?: {
  page?: number;
  limit?: number;
}) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 50;
  const [items, total, sum] = await Promise.all([
    prisma.expense.findMany({
      include: {
        recordedBy: { select: { fullName: true } },
      },
      orderBy: { expenseDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.expense.count(),
    prisma.expense.aggregate({ _sum: { amount: true } }),
  ]);
  return {
    items,
    total,
    page,
    limit,
    totalAmount: Number(sum._sum.amount || 0),
  };
}

export async function listAnnouncements() {
  return prisma.announcement.findMany({
    include: {
      createdBy: { select: { fullName: true } },
    },
    orderBy: { publishedAt: "desc" },
  });
}

export async function listNotifications(userId?: string) {
  const where = userId ? { userId } : {};
  return prisma.notification.findMany({
    where,
    include: {
      user: { select: { fullName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function listAuditLogs(filters?: {
  page?: number;
  limit?: number;
}) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 50;
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: {
        user: { select: { fullName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count(),
  ]);
  return { items, total, page, limit };
}

export async function getPropertySettings() {
  return prisma.propertySettings.findFirst();
}

export async function updatePropertySettings(
  data: {
    name?: string;
    location?: string | null;
    phone?: string | null;
    email?: string | null;
    description?: string | null;
    rentDueDay?: number;
    lateFeeAmount?: number | null;
  },
  userId: string
) {
  const existing = await prisma.propertySettings.findFirst();
  if (!existing) {
    return prisma.propertySettings.create({
      data: {
        name: data.name || "THE DEED HOSTELS",
        location: data.location,
        phone: data.phone,
        email: data.email,
        description: data.description,
        rentDueDay: data.rentDueDay ?? 5,
        lateFeeAmount: data.lateFeeAmount,
      },
    });
  }
  return prisma.propertySettings.update({
    where: { id: existing.id },
    data,
  });
}

export async function createExpense(
  data: {
    category: string;
    description: string;
    amount: number;
    expenseDate: Date;
  },
  userId: string
) {
  return prisma.expense.create({
    data: {
      category: data.category as any,
      description: data.description,
      amount: data.amount,
      expenseDate: data.expenseDate,
      recordedById: userId,
    },
  });
}

export async function createAnnouncement(
  data: {
    title: string;
    content: string;
    target?: string;
  },
  userId: string
) {
  return prisma.announcement.create({
    data: {
      title: data.title,
      content: data.content,
      target: (data.target as any) || "ALL_TENANTS",
      createdById: userId,
    },
  });
}

export async function getReportsData() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [
    totalHouses,
    occupied,
    vacant,
    maintenance,
    activeTenants,
    paymentsMonth,
    expensesMonth,
    paymentsByMethod,
    allTenants,
  ] = await Promise.all([
    prisma.house.count({ where: { isActive: true } }),
    prisma.house.count({ where: { isActive: true, status: "OCCUPIED" } }),
    prisma.house.count({ where: { isActive: true, status: "VACANT" } }),
    prisma.house.count({ where: { isActive: true, status: "MAINTENANCE" } }),
    prisma.tenant.count({ where: { status: "ACTIVE" } }),
    prisma.payment.aggregate({
      where: {
        status: PaymentStatus.COMPLETED,
        paymentDate: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.expense.aggregate({
      where: { expenseDate: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ["paymentMethod"],
      where: {
        status: PaymentStatus.COMPLETED,
        paymentDate: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.tenant.findMany({
      where: { status: "ACTIVE" },
      select: {
        balance: true,
        house: { select: { monthlyRent: true } },
      },
    }),
  ]);

  const expectedRent = allTenants.reduce(
    (s, t) => s + (t.house ? Number(t.house.monthlyRent) : 0),
    0
  );
  const outstanding = allTenants.reduce(
    (s, t) => s + Math.max(0, Number(t.balance)),
    0
  );
  const collected = Number(paymentsMonth._sum.amount || 0);
  const expenses = Number(expensesMonth._sum.amount || 0);
  const collectionPct =
    expectedRent > 0 ? Math.round((collected / expectedRent) * 100) : 0;
  const occupancyPct =
    totalHouses > 0 ? Math.round((occupied / totalHouses) * 100) : 0;

  return {
    occupancy: {
      total: totalHouses,
      occupied,
      vacant,
      maintenance,
      percentage: occupancyPct,
    },
    rent: {
      expected: expectedRent,
      collected,
      outstanding,
      collectionPercentage: collectionPct,
      paymentCount: paymentsMonth._count,
    },
    expenses: { total: expenses },
    netIncome: collected - expenses,
    paymentsByMethod: paymentsByMethod.map((p) => ({
      method: p.paymentMethod,
      amount: Number(p._sum.amount || 0),
      count: p._count,
    })),
    activeTenants,
  };
}