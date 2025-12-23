import { z } from "zod";
import { Role } from "@prisma/client";

export const userCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
});

export const userUpdateSchema = userCreateSchema.partial().refine((obj) => Object.keys(obj).length > 0, {
  message: "At least one field must be provided",
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;