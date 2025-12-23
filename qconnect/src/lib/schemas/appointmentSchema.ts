import { z } from "zod";

export const appointmentCreateSchema = z.object({
  queueId: z.number({ invalid_type_error: "queueId must be a number" }),
  userId: z.number({ invalid_type_error: "userId must be a number" }),
});

export const appointmentUpdateSchema = z.object({
  status: z.string().optional(),
  tokenNo: z.number().optional(),
});