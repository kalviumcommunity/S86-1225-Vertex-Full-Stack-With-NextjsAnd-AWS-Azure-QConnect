import { PrismaClient, Role, Status } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...\n");

  // ============ SEED USERS ============
  console.log("📝 Seeding Users...");
  const users = [
    { name: "Alice Johnson", email: "alice@example.com", phone: "9999999999", role: Role.PATIENT },
    { name: "Bob Smith", email: "bob@example.com", phone: "8888888888", role: Role.PATIENT },
    { name: "Charlie Brown", email: "charlie@example.com", phone: "7777777777", role: Role.PATIENT },
    { name: "Diana Prince", email: "diana@example.com", phone: "6666666666", role: Role.PATIENT },
    { name: "Admin User", email: "admin@example.com", phone: "5555555555", role: Role.ADMIN },
  ];

  const createdUsers: any[] = [];
  for (const u of users) {
    const user = await prisma.user.upsert({
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
    createdUsers.push(user);
    console.log(`  ✓ ${u.name} (${u.email})`);
  }

  // ============ SEED DOCTORS ============
  console.log("\n👨‍⚕️ Seeding Doctors...");
  const doctors = [
    { name: "Dr. Smith", specialty: "Cardiology", roomNo: "A101" },
    { name: "Dr. Johnson", specialty: "Neurology", roomNo: "B202" },
    { name: "Dr. Williams", specialty: "Orthopedics", roomNo: "C303" },
    { name: "Dr. Brown", specialty: "Dermatology", roomNo: "D404" },
  ];

  const createdDoctors: any[] = [];
  for (const d of doctors) {
    const doctor = await prisma.doctor.upsert({
      where: { id: doctors.indexOf(d) + 1 },
      update: d,
      create: d,
    });
    createdDoctors.push(doctor);
    console.log(`  ✓ ${d.name} - ${d.specialty} (Room ${d.roomNo})`);
  }

  // ============ SEED QUEUES ============
  console.log("\n📋 Seeding Queues...");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const queues = [];
  for (let i = 0; i < createdDoctors.length; i++) {
    const queueDate = new Date(tomorrow);
    queueDate.setDate(queueDate.getDate() + i);

    const queue = await prisma.queue.upsert({
      where: { id: i + 1 },
      update: {},
      create: {
        doctorId: createdDoctors[i].id,
        date: queueDate,
        currentNo: 0,
      },
    });
    queues.push(queue);
    console.log(`  ✓ Queue for Dr. ${createdDoctors[i].name} on ${queueDate.toLocaleDateString()}`);
  }

  // ============ SEED APPOINTMENTS ============
  console.log("\n🗓️ Seeding Appointments...");
  const appointments = [];
  const appointmentData = [
    { userId: createdUsers[0].id, queueId: queues[0].id, tokenNo: 1, status: Status.PENDING },
    { userId: createdUsers[1].id, queueId: queues[0].id, tokenNo: 2, status: Status.PENDING },
    { userId: createdUsers[2].id, queueId: queues[1].id, tokenNo: 1, status: Status.IN_PROGRESS },
    { userId: createdUsers[3].id, queueId: queues[2].id, tokenNo: 1, status: Status.COMPLETED },
  ];

  for (const apt of appointmentData) {
    const appointment = await prisma.appointment.upsert({
      where: {
        queueId_tokenNo: {
          queueId: apt.queueId,
          tokenNo: apt.tokenNo,
        },
      },
      update: { status: apt.status },
      create: apt,
    });
    appointments.push(appointment);
    const user = createdUsers.find((u) => u.id === apt.userId);
    console.log(`  ✓ Appointment #${apt.tokenNo} for ${user?.name} - Status: ${apt.status}`);
  }

  // ============ SEED FILES ============
  console.log("\n📁 Seeding Files...");
  const files = [
    { name: "prescription_1.pdf", url: "/uploads/prescription_1.pdf", mime: "application/pdf", size: 250000, uploaderEmail: "alice@example.com" },
    { name: "medical_report.pdf", url: "/uploads/medical_report.pdf", mime: "application/pdf", size: 450000, uploaderEmail: "bob@example.com" },
    { name: "lab_results.xlsx", url: "/uploads/lab_results.xlsx", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 120000, uploaderEmail: "charlie@example.com" },
  ];

  for (const f of files) {
    const file = await prisma.file.upsert({
      where: { id: files.indexOf(f) + 1 },
      update: f,
      create: f,
    });
    console.log(`  ✓ ${f.name} (${(f.size! / 1024).toFixed(2)} KB)`);
  }

  console.log("\n✅ Database seeding completed successfully!\n");
  console.log("📊 Summary:");
  console.log(`  • Users: ${createdUsers.length}`);
  console.log(`  • Doctors: ${createdDoctors.length}`);
  console.log(`  • Queues: ${queues.length}`);
  console.log(`  • Appointments: ${appointments.length}`);
  console.log(`  • Files: ${files.length}\n`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
