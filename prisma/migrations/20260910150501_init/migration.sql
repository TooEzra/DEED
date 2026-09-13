-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CARETAKER', 'TENANT');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "HouseStatus" AS ENUM ('VACANT', 'OCCUPIED', 'MAINTENANCE', 'RESERVED');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MOVED_OUT');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('RENT', 'DEPOSIT', 'UTILITY', 'PENALTY', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('MPESA', 'BANK', 'CASH', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "LeaseStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED');

-- CreateEnum
CREATE TYPE "MaintenanceCategory" AS ENUM ('PLUMBING', 'ELECTRICAL', 'SECURITY', 'CLEANING', 'STRUCTURAL', 'WATER', 'OTHER');

-- CreateEnum
CREATE TYPE "MaintenancePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('PENDING', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('REPAIRS', 'WATER', 'ELECTRICITY', 'SECURITY', 'CLEANING', 'MAINTENANCE', 'SALARIES', 'SUPPLIES', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('RENT_DUE', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'RENT_OVERDUE', 'MAINTENANCE_UPDATE', 'LEASE_EXPIRING', 'ANNOUNCEMENT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AnnouncementTarget" AS ENUM ('ALL_TENANTS', 'ALL_USERS', 'CARETAKERS');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "full_name" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_settings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'THE DEED HOSTELS',
    "location" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "logo_url" TEXT,
    "description" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "rent_due_day" INTEGER NOT NULL DEFAULT 5,
    "late_fee_amount" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "houses" (
    "id" TEXT NOT NULL,
    "house_number" TEXT NOT NULL,
    "house_type" TEXT NOT NULL,
    "monthly_rent" DECIMAL(12,2) NOT NULL,
    "deposit_amount" DECIMAL(12,2) NOT NULL,
    "status" "HouseStatus" NOT NULL DEFAULT 'VACANT',
    "description" TEXT,
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "houses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "national_id" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" TEXT,
    "house_id" TEXT,
    "move_in_date" TIMESTAMP(3),
    "move_out_date" TIMESTAMP(3),
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caretakers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caretakers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leases" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "house_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "monthly_rent" DECIMAL(12,2) NOT NULL,
    "deposit_amount" DECIMAL(12,2) NOT NULL,
    "status" "LeaseStatus" NOT NULL DEFAULT 'ACTIVE',
    "document_url" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "house_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "payment_type" "PaymentType" NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "transaction_reference" TEXT,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "recorded_by" TEXT,
    "notes" TEXT,
    "mpesa_checkout_request_id" TEXT,
    "mpesa_receipt_number" TEXT,
    "receipt_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_requests" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "house_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "MaintenanceCategory" NOT NULL,
    "priority" "MaintenancePriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'PENDING',
    "assigned_to" TEXT,
    "estimated_cost" DECIMAL(12,2),
    "actual_cost" DECIMAL(12,2),
    "notes" TEXT,
    "resolved_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_attachments" (
    "id" TEXT NOT NULL,
    "maintenance_request_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "expense_date" TIMESTAMP(3) NOT NULL,
    "recorded_by" TEXT NOT NULL,
    "receipt_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "target" "AnnouncementTarget" NOT NULL DEFAULT 'ALL_TENANTS',
    "created_by" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_reads" (
    "id" TEXT NOT NULL,
    "announcement_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcement_reads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "houses_house_number_key" ON "houses"("house_number");

-- CreateIndex
CREATE INDEX "houses_status_idx" ON "houses"("status");

-- CreateIndex
CREATE INDEX "houses_house_type_idx" ON "houses"("house_type");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_user_id_key" ON "tenants"("user_id");

-- CreateIndex
CREATE INDEX "tenants_status_idx" ON "tenants"("status");

-- CreateIndex
CREATE INDEX "tenants_house_id_idx" ON "tenants"("house_id");

-- CreateIndex
CREATE UNIQUE INDEX "caretakers_user_id_key" ON "caretakers"("user_id");

-- CreateIndex
CREATE INDEX "leases_tenant_id_idx" ON "leases"("tenant_id");

-- CreateIndex
CREATE INDEX "leases_house_id_idx" ON "leases"("house_id");

-- CreateIndex
CREATE INDEX "leases_status_idx" ON "leases"("status");

-- CreateIndex
CREATE INDEX "leases_end_date_idx" ON "leases"("end_date");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transaction_reference_key" ON "payments"("transaction_reference");

-- CreateIndex
CREATE UNIQUE INDEX "payments_receipt_number_key" ON "payments"("receipt_number");

-- CreateIndex
CREATE INDEX "payments_tenant_id_idx" ON "payments"("tenant_id");

-- CreateIndex
CREATE INDEX "payments_house_id_idx" ON "payments"("house_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_payment_date_idx" ON "payments"("payment_date");

-- CreateIndex
CREATE INDEX "payments_payment_type_idx" ON "payments"("payment_type");

-- CreateIndex
CREATE INDEX "maintenance_requests_tenant_id_idx" ON "maintenance_requests"("tenant_id");

-- CreateIndex
CREATE INDEX "maintenance_requests_house_id_idx" ON "maintenance_requests"("house_id");

-- CreateIndex
CREATE INDEX "maintenance_requests_status_idx" ON "maintenance_requests"("status");

-- CreateIndex
CREATE INDEX "maintenance_requests_priority_idx" ON "maintenance_requests"("priority");

-- CreateIndex
CREATE INDEX "maintenance_attachments_maintenance_request_id_idx" ON "maintenance_attachments"("maintenance_request_id");

-- CreateIndex
CREATE INDEX "expenses_category_idx" ON "expenses"("category");

-- CreateIndex
CREATE INDEX "expenses_expense_date_idx" ON "expenses"("expense_date");

-- CreateIndex
CREATE INDEX "announcements_published_at_idx" ON "announcements"("published_at");

-- CreateIndex
CREATE INDEX "announcements_is_active_idx" ON "announcements"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "announcement_reads_announcement_id_user_id_key" ON "announcement_reads"("announcement_id", "user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_house_id_fkey" FOREIGN KEY ("house_id") REFERENCES "houses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caretakers" ADD CONSTRAINT "caretakers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_house_id_fkey" FOREIGN KEY ("house_id") REFERENCES "houses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_house_id_fkey" FOREIGN KEY ("house_id") REFERENCES "houses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_house_id_fkey" FOREIGN KEY ("house_id") REFERENCES "houses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_attachments" ADD CONSTRAINT "maintenance_attachments_maintenance_request_id_fkey" FOREIGN KEY ("maintenance_request_id") REFERENCES "maintenance_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_reads" ADD CONSTRAINT "announcement_reads_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
