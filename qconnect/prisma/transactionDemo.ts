import { PrismaClient } from "@prisma/client";
import { bookAppointment, bookAppointmentWithError } from "../src/lib/appointmentService";

const prisma = new PrismaClient();

async function ensureDemoData() {
  const doctor = await prisma.doctor.upsert({
    where: { id: 1 },
    update: {},
    create: { name: "Dr. Demo", specialty: "General", roomNo: "100" },
  });

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  let queue = await prisma.queue.findFirst({ where: { doctorId: doctor.id, date: today } });
  if (!queue) {
    queue = await prisma.queue.create({ data: { doctorId: doctor.id, date: today } });
  }

  const user = await prisma.user.upsert({
    where: { email: "demo-user@example.com" },
    update: { name: "Demo User" },
    create: { name: "Demo User", email: "demo-user@example.com", role: "PATIENT", phone: "7777777777" },
  });

  return { doctor, queue, user };
}

async function main() {
  console.log("=== Transaction demo starting ===");

  const { queue, user } = await ensureDemoData();

  // Snapshot before
  const beforeQueue = await prisma.queue.findUnique({ where: { id: queue.id } });
  const beforeCount = await prisma.appointment.count({ where: { queueId: queue.id } });
  console.log("Before - queue.currentNo:", beforeQueue?.currentNo, "appointments:", beforeCount);

  // Successful booking
  const appointment = await bookAppointment(queue.id, user.id);
  console.log("Successful booking created appointment:", appointment);

  const afterQueue = await prisma.queue.findUnique({ where: { id: queue.id } });
  const afterCount = await prisma.appointment.count({ where: { queueId: queue.id } });
  console.log("After successful booking - queue.currentNo:", afterQueue?.currentNo, "appointments:", afterCount);

  // Now demonstrate rollback on error
  try {
    await bookAppointmentWithError(queue.id, user.id);
  } catch (e: any ) {
    console.log("Expected error during bookingWithError:", e.message);
  }

  const finalQueue = await prisma.queue.findUnique({ where: { id: queue.id } });
  const finalCount = await prisma.appointment.count({ where: { queueId: queue.id } });
  console.log("After failed booking attempt - queue.currentNo:", finalQueue?.currentNo, "appointments:", finalCount);

  console.log("=== Transaction demo finished ===");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
