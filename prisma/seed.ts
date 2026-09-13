/**
 * THE DEED HOSTELS — Development Seed Data
 * Creates only Admin, Caretaker, and property settings.
 * No dummy houses or tenants — start fresh with your real data.
 */

import {
  PrismaClient,
  Role,
  UserStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding THE DEED HOSTELS (clean start)...");

  // Clear all operational data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.announcementRead.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.maintenanceAttachment.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.caretaker.deleteMany();
  await prisma.house.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.propertySettings.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 12);

  // Property settings (exactly one record)
  await prisma.propertySettings.create({
    data: {
      name: "THE DEED HOSTELS",
      location: "Nairobi, Kenya",
      phone: "+254712345678",
      email: "info@thedeedhostels.com",
      description:
        "Modern, comfortable hostel accommodation in the heart of Nairobi.",
      currency: "KES",
      rentDueDay: 5,
      lateFeeAmount: 500,
    },
  });

  // Admin account
  await prisma.user.create({
    data: {
      email: "admin@thedeedhostels.com",
      phone: "+254700000001",
      passwordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      fullName: "System Administrator",
    },
  });

  // Caretaker account
  const caretakerUser = await prisma.user.create({
    data: {
      email: "caretaker@thedeedhostels.com",
      phone: "+254700000002",
      passwordHash,
      role: Role.CARETAKER,
      status: UserStatus.ACTIVE,
      fullName: "James Mwangi",
    },
  });
  await prisma.caretaker.create({
    data: {
      userId: caretakerUser.id,
      fullName: "James Mwangi",
      phone: "+254700000002",
      email: "caretaker@thedeedhostels.com",
    },
  });

  console.log("✅ Seed complete (no sample houses or tenants).");
  console.log("");
  console.log("── Login credentials ──");
  console.log("Admin:     admin@thedeedhostels.com / Password123!");
  console.log("Caretaker: caretaker@thedeedhostels.com / Password123!");
  console.log("───────────────────────");
  console.log("Add your real houses and tenants from the Admin panel.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });