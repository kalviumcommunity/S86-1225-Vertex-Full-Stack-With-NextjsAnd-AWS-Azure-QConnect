import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = [
    { name: "Alice", email: "alice@example.com", phone: "9999999999", role: Role.PATIENT },
    { name: "Bob",   email: "bob@example.com",   phone: "8888888888", role: Role.PATIENT },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        phone: u.phone,
        role: u.role,
      },
      create: {
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
      },
    });
  }

  console.log("✅ Seed data inserted (upserted) successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
