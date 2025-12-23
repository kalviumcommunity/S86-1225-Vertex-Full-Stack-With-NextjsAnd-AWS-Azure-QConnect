import { z } from "zod";

export const queueCreateSchema = z.object({
  doctorId: z.number({ invalid_type_error: "doctorId must be a number" }),
  date: z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: "date must be an ISO date string",
  }),
});

export const queueUpdateSchema = z.object({
  date: z.string().optional(),
  currentNo: z.number().optional(),
});
