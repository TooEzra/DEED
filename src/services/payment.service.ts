import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/audit";
import { generateReceiptNumber } from "@/lib/utils";
import {
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  Prisma,
} from "@prisma/client";
import { initiateStkPush, parseMpesaCallback, type MpesaCallbackBody } from "@/lib/payments/mpesa";

export async function createPayment(params: {
  tenantId: string;
  houseId: string;
  amount: number;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  paymentDate?: Date;
  notes?: string;
  recordedById?: string;
  status?: PaymentStatus;
}) {
  const receiptNumber = generateReceiptNumber();

  const payment = await prisma.$transaction(async (tx) => {
    const created = await tx.payment.create({
      data: {
        tenantId: params.tenantId,
        houseId: params.houseId,
        amount: params.amount,
        paymentType: params.paymentType,
        paymentMethod: params.paymentMethod,
        transactionReference: params.transactionReference,
        paymentDate: params.paymentDate || new Date(),
        status: params.status || PaymentStatus.COMPLETED,
        recordedById: params.recordedById,
        notes: params.notes,
        receiptNumber,
      },
      include: {
        tenant: true,
        house: true,
      },
    });

    // Update tenant balance only for completed rent/deposit payments
    if (
      created.status === PaymentStatus.COMPLETED &&
      (params.paymentType === PaymentType.RENT ||
        params.paymentType === PaymentType.DEPOSIT)
    ) {
      await tx.tenant.update({
        where: { id: params.tenantId },
        data: {
          balance: {
            decrement: params.amount,
          },
        },
      });
    }

    return created;
  });

  await createAuditLog({
    userId: params.recordedById,
    action: "PAYMENT_CREATED",
    entityType: "Payment",
    entityId: payment.id,
    newValues: {
      amount: params.amount,
      type: params.paymentType,
      method: params.paymentMethod,
      status: payment.status,
    },
  });

  return payment;
}

export async function initiateMpesaPayment(params: {
  tenantId: string;
  houseId: string;
  amount: number;
  phone: string;
  userId: string;
}) {
  // Create pending payment first
  const receiptNumber = generateReceiptNumber();

  const payment = await prisma.payment.create({
    data: {
      tenantId: params.tenantId,
      houseId: params.houseId,
      amount: params.amount,
      paymentType: PaymentType.RENT,
      paymentMethod: PaymentMethod.MPESA,
      paymentDate: new Date(),
      status: PaymentStatus.PENDING,
      recordedById: params.userId,
      receiptNumber,
    },
  });

  try {
    const stk = await initiateStkPush({
      amount: params.amount,
      phone: params.phone,
      accountReference: receiptNumber,
      transactionDesc: "Rent Payment",
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        mpesaCheckoutRequestId: stk.CheckoutRequestID,
      },
    });

    return {
      paymentId: payment.id,
      checkoutRequestId: stk.CheckoutRequestID,
      customerMessage: stk.CustomerMessage,
    };
  } catch (error) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED },
    });
    throw error;
  }
}

/**
 * Process M-Pesa callback. Only marks COMPLETED after successful validation.
 */
export async function processMpesaCallback(body: MpesaCallbackBody) {
  const parsed = parseMpesaCallback(body);

  const payment = await prisma.payment.findFirst({
    where: { mpesaCheckoutRequestId: parsed.checkoutRequestId },
  });

  if (!payment) {
    console.error("Payment not found for checkout:", parsed.checkoutRequestId);
    return { success: false, message: "Payment not found" };
  }

  if (payment.status === PaymentStatus.COMPLETED) {
    return { success: true, message: "Already processed" };
  }

  if (!parsed.success) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
        notes: parsed.resultDesc,
      },
    });
    return { success: false, message: parsed.resultDesc };
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        mpesaReceiptNumber: parsed.mpesaReceiptNumber,
        transactionReference: parsed.mpesaReceiptNumber,
      },
    });

    await tx.tenant.update({
      where: { id: payment.tenantId },
      data: {
        balance: { decrement: Number(payment.amount) },
      },
    });
  });

  await createAuditLog({
    action: "MPESA_PAYMENT_COMPLETED",
    entityType: "Payment",
    entityId: payment.id,
    newValues: {
      amount: Number(payment.amount),
      receipt: parsed.mpesaReceiptNumber,
    },
  });

  return { success: true, paymentId: payment.id };
}

export async function getTenantBalance(tenantId: string): Promise<number> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { balance: true },
  });
  return tenant ? Number(tenant.balance) : 0;
}

export async function listPayments(filters: {
  tenantId?: string;
  houseId?: string;
  status?: PaymentStatus;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: Prisma.PaymentWhereInput = {};
  if (filters.tenantId) where.tenantId = filters.tenantId;
  if (filters.houseId) where.houseId = filters.houseId;
  if (filters.status) where.status = filters.status;
  if (filters.from || filters.to) {
    where.paymentDate = {};
    if (filters.from) where.paymentDate.gte = filters.from;
    if (filters.to) where.paymentDate.lte = filters.to;
  }

  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        tenant: { select: { fullName: true, phone: true } },
        house: { select: { houseNumber: true } },
        recordedBy: { select: { fullName: true } },
      },
      orderBy: { paymentDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
