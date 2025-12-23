import { z } from "zod";

export const doctorCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  specialty: z.string().min(2, "Specialty is required"),
  roomNo: z.string().min(1, "roomNo is required"),
});

export const doctorUpdateSchema = doctorCreateSchema.partial().refine((obj) => Object.keys(obj).length > 0, {
  message: "At least one field must be provided",
});
