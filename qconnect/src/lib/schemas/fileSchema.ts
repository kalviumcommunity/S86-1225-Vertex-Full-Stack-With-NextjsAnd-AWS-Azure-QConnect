import { z } from "zod";

export const fileCreateSchema = z.object({
  fileName: z.string().min(1, "File name is required").max(255, "File name must be 255 characters or less"),
  fileURL: z.string().url("Invalid file URL"),
  size: z.number().positive("File size must be greater than 0").optional(),
  mime: z.string().optional(),
});

export const fileMetadataSchema = z.object({
  name: z.string().min(1, "File name is required"),
  url: z.string().url("Invalid file URL"),
  size: z.number().positive().optional().nullable(),
  mime: z.string().optional(),
  uploaderEmail: z.string().email().optional().nullable(),
});

export type FileCreateInput = z.infer<typeof fileCreateSchema>;
export type FileMetadata = z.infer<typeof fileMetadataSchema>;
