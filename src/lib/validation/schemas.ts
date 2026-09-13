import { z } from "zod";

// ── Auth ──────────────────────────────────────
export const loginSchema = z.object({
  emailOrPhone: z.string().min(1, "Email or phone is required"),
  password: z.string().min(1, "Password is required"),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email("Valid email required"),
});

export const passwordResetSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

// ── House ─────────────────────────────────────
export const houseSchema = z.object({
  houseNumber: z.string().min(1, "House number is required").max(20),
  houseType: z.string().min(1, "House type is required"),
  monthlyRent: z.coerce.number().positive("Rent must be positive"),
  depositAmount: z.coerce.number().min(0, "Deposit cannot be negative"),
  status: z.enum(["VACANT", "OCCUPIED", "MAINTENANCE", "RESERVED"]).optional(),
  description: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

export const houseUpdateSchema = houseSchema.partial();

// ── Tenant ────────────────────────────────────
export const tenantCreateSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  nationalId: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  houseId: z.string().uuid().optional().nullable(),
  moveInDate: z.coerce.date().optional(),
});

export const tenantUpdateSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  email: z.string().email().optional(),
  nationalId: z.string().optional().nullable(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "MOVED_OUT"]).optional(),
});

// ── Caretaker ─────────────────────────────────
export const caretakerCreateSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(8),
});

// ── Payment ───────────────────────────────────
export const paymentCreateSchema = z.object({
  tenantId: z.string().uuid(),
  houseId: z.string().uuid(),
  amount: z.coerce.number().positive("Amount must be positive"),
  paymentType: z.enum(["RENT", "DEPOSIT", "UTILITY", "PENALTY", "OTHER"]),
  paymentMethod: z.enum(["MPESA", "BANK", "CASH", "OTHER"]),
  transactionReference: z.string().optional(),
  paymentDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const mpesaStkPushSchema = z.object({
  amount: z.coerce.number().positive(),
  phone: z.string().min(10),
  tenantId: z.string().uuid(),
});

// ── Maintenance ───────────────────────────────
export const maintenanceCreateSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Please provide more details"),
  category: z.enum([
    "PLUMBING",
    "ELECTRICAL",
    "SECURITY",
    "CLEANING",
    "STRUCTURAL",
    "WATER",
    "OTHER",
  ]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
});

export const maintenanceUpdateSchema = z.object({
  status: z
    .enum(["PENDING", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "CLOSED"])
    .optional(),
  notes: z.string().optional(),
  estimatedCost: z.coerce.number().min(0).optional().nullable(),
  actualCost: z.coerce.number().min(0).optional().nullable(),
  assignedToId: z.string().uuid().optional().nullable(),
});

// ── Lease ─────────────────────────────────────
export const leaseCreateSchema = z.object({
  tenantId: z.string().uuid(),
  houseId: z.string().uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  monthlyRent: z.coerce.number().positive(),
  depositAmount: z.coerce.number().min(0),
  notes: z.string().optional(),
});

// ── Expense ───────────────────────────────────
export const expenseCreateSchema = z.object({
  category: z.enum([
    "REPAIRS",
    "WATER",
    "ELECTRICITY",
    "SECURITY",
    "CLEANING",
    "MAINTENANCE",
    "SALARIES",
    "SUPPLIES",
    "OTHER",
  ]),
  description: z.string().min(3),
  amount: z.coerce.number().positive(),
  expenseDate: z.coerce.date(),
});

// ── Announcement ──────────────────────────────
export const announcementCreateSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  target: z.enum(["ALL_TENANTS", "ALL_USERS", "CARETAKERS"]).default("ALL_TENANTS"),
  expiresAt: z.coerce.date().optional().nullable(),
});

// ── Property Settings ─────────────────────────
export const propertySettingsSchema = z.object({
  name: z.string().min(1).optional(),
  location: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  description: z.string().optional().nullable(),
  rentDueDay: z.coerce.number().int().min(1).max(28).optional(),
  lateFeeAmount: z.coerce.number().min(0).optional().nullable(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type HouseInput = z.infer<typeof houseSchema>;
export type TenantCreateInput = z.infer<typeof tenantCreateSchema>;
export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
export type MaintenanceCreateInput = z.infer<typeof maintenanceCreateSchema>;
export type LeaseCreateInput = z.infer<typeof leaseCreateSchema>;
export type ExpenseCreateInput = z.infer<typeof expenseCreateSchema>;
export type AnnouncementCreateInput = z.infer<typeof announcementCreateSchema>;
