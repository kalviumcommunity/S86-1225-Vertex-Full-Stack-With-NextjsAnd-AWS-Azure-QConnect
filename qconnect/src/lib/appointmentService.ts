import { PrismaClient, Status } from "@prisma/client";

const prisma = new PrismaClient();

export async function bookAppointment(queueId: number, userId: number) {
  return prisma.$transaction(async (tx) => {
    const q = await tx.queue.findUnique({ where: { id: queueId }, select: { currentNo: true } });
    if (!q) throw new Error("Queue not found");

    const tokenNo = q.currentNo + 1;

    const appointment = await tx.appointment.create({
      data: {
        tokenNo,
        status: Status.PENDING,
        userId,
        queueId,
      },
    });

    await tx.queue.update({ where: { id: queueId }, data: { currentNo: { increment: 1 } } });

    return appointment;
  });
}

// Function to demonstrate a transaction that fails after creating an appointment
// This should rollback both the appointment create and the queue increment
export async function bookAppointmentWithError(queueId: number, userId: number) {
  return prisma.$transaction(async (tx) => {
    const q = await tx.queue.findUnique({ where: { id: queueId }, select: { currentNo: true } });
    if (!q) throw new Error("Queue not found");

    const tokenNo = q.currentNo + 1;

    await tx.appointment.create({
      data: {
        tokenNo,
        status: Status.PENDING,
        userId,
        queueId,
      },
    });

    // Simulate a failure that occurs after creating the appointment
    throw new Error("Simulated failure: forcing transaction rollback");

    // Note: any code here would not run because of the thrown error
  });
}
