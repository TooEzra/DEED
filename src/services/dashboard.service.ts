import { prisma } from "@/lib/db/prisma";
import { HouseStatus, MaintenanceStatus, PaymentStatus, TenantStatus } from "@prisma/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function getAdminDashboardStats() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    totalHouses,
    occupiedHouses,
    vacantHouses,
    totalTenants,
    pendingMaintenance,
    monthPayments,
    allActiveTenants,
    recentPayments,
    recentTenants,
    recentMaintenance,
    expiringLeases,
  ] = await Promise.all([
    prisma.house.count({ where: { isActive: true } }),
    prisma.house.count({
      where: { isActive: true, status: HouseStatus.OCCUPIED },
    }),
    prisma.house.count({
      where: { isActive: true, status: HouseStatus.VACANT },
    }),
    prisma.tenant.count({ where: { status: TenantStatus.ACTIVE } }),
    prisma.maintenanceRequest.count({
      where: {
        status: {
          in: [
            MaintenanceStatus.PENDING,
            MaintenanceStatus.ACKNOWLEDGED,
            MaintenanceStatus.IN_PROGRESS,
          ],
        },
      },
    }),
    prisma.payment.aggregate({
      where: {
        status: PaymentStatus.COMPLETED,
        paymentDate: { gte: monthStart, lte: monthEnd },
        paymentType: "RENT",
      },
      _sum: { amount: true },
    }),
    prisma.tenant.findMany({
      where: { status: TenantStatus.ACTIVE },
      select: {
        balance: true,
        house: { select: { monthlyRent: true } },
      },
    }),
    prisma.payment.findMany({
      where: { status: PaymentStatus.COMPLETED },
      orderBy: { paymentDate: "desc" },
      take: 5,
      include: {
        tenant: { select: { fullName: true } },
        house: { select: { houseNumber: true } },
      },
    }),
    prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { house: { select: { houseNumber: true } } },
    }),
    prisma.maintenanceRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        tenant: { select: { fullName: true } },
        house: { select: { houseNumber: true } },
      },
    }),
    prisma.lease.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          gte: now,
        },
      },
      include: {
        tenant: { select: { fullName: true } },
        house: { select: { houseNumber: true } },
      },
    }),
  ]);

  const expectedMonthlyRent = allActiveTenants.reduce(
    (sum, t) => sum + (t.house ? Number(t.house.monthlyRent) : 0),
    0
  );
  const outstandingRent = allActiveTenants.reduce(
    (sum, t) => sum + Math.max(0, Number(t.balance)),
    0
  );
  const tenantsWithOutstanding = allActiveTenants.filter(
    (t) => Number(t.balance) > 0
  ).length;

  const rentCollected = Number(monthPayments._sum.amount || 0);

  // Monthly collection trend (last 6 months)
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i);
    const start = startOfMonth(d);
    const end = endOfMonth(d);
    const agg = await prisma.payment.aggregate({
      where: {
        status: PaymentStatus.COMPLETED,
        paymentType: "RENT",
        paymentDate: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });
    monthlyTrend.push({
      month: format(d, "MMM yyyy"),
      amount: Number(agg._sum.amount || 0),
    });
  }

  // Monthly expenses
  const monthExpenses = await prisma.expense.aggregate({
    where: { expenseDate: { gte: monthStart, lte: monthEnd } },
    _sum: { amount: true },
  });

  const totalExpenses = Number(monthExpenses._sum.amount || 0);
  const netIncome = rentCollected - totalExpenses;
  const occupancyRate =
    totalHouses > 0 ? Math.round((occupiedHouses / totalHouses) * 100) : 0;

  return {
    summary: {
      totalHouses,
      occupiedHouses,
      vacantHouses,
      totalTenants,
      expectedMonthlyRent,
      rentCollected,
      outstandingRent,
      pendingMaintenance,
      occupancyRate,
      totalExpenses,
      netIncome,
      tenantsWithOutstanding,
      expiringLeasesCount: expiringLeases.length,
    },
    monthlyTrend,
    recentPayments,
    recentTenants,
    recentMaintenance,
    expiringLeases,
  };
}

export async function getCaretakerDashboardStats() {
  const [
    totalHouses,
    occupiedHouses,
    vacantHouses,
    pendingMaintenance,
    resolvedMaintenance,
    recentRequests,
    recentAnnouncements,
  ] = await Promise.all([
    prisma.house.count({ where: { isActive: true } }),
    prisma.house.count({
      where: { isActive: true, status: HouseStatus.OCCUPIED },
    }),
    prisma.house.count({
      where: { isActive: true, status: HouseStatus.VACANT },
    }),
    prisma.maintenanceRequest.count({
      where: {
        status: {
          in: [
            MaintenanceStatus.PENDING,
            MaintenanceStatus.ACKNOWLEDGED,
            MaintenanceStatus.IN_PROGRESS,
          ],
        },
      },
    }),
    prisma.maintenanceRequest.count({
      where: { status: MaintenanceStatus.RESOLVED },
    }),
    prisma.maintenanceRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        tenant: { select: { fullName: true, phone: true } },
        house: { select: { houseNumber: true } },
      },
    }),
    prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { publishedAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    totalHouses,
    occupiedHouses,
    vacantHouses,
    pendingMaintenance,
    resolvedMaintenance,
    recentRequests,
    recentAnnouncements,
  };
}

export async function getTenantDashboard(userId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { userId },
    include: {
      house: true,
      leases: {
        where: { status: "ACTIVE" },
        take: 1,
        orderBy: { startDate: "desc" },
      },
      payments: {
        orderBy: { paymentDate: "desc" },
        take: 5,
      },
      maintenanceRequests: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!tenant) return null;

  const property = await prisma.propertySettings.findFirst();
  const announcements = await prisma.announcement.findMany({
    where: { isActive: true, target: { in: ["ALL_TENANTS", "ALL_USERS"] } },
    orderBy: { publishedAt: "desc" },
    take: 5,
  });

  const rentDueDay = property?.rentDueDay || 5;
  const now = new Date();
  let nextDue = new Date(now.getFullYear(), now.getMonth(), rentDueDay);
  if (nextDue <= now) {
    nextDue = new Date(now.getFullYear(), now.getMonth() + 1, rentDueDay);
  }

  const monthlyRent = tenant.house ? Number(tenant.house.monthlyRent) : 0;
  const balance = Number(tenant.balance);
  const amountPaid = Math.max(0, monthlyRent - balance);

  return {
    tenant,
    property,
    announcements,
    rentSummary: {
      monthlyRent,
      amountPaid,
      outstanding: Math.max(0, balance),
      nextDueDate: nextDue,
    },
  };
}
