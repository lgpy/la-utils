import { ChangelogDetailType } from "@/generated/prisma";
import { z } from "zod";

export const paginatedChangelogSchema = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  cursor: z.number().int().min(0).default(0),
});

export const paginatedChangelogOutputSchema = z.object({
  entries: z.object({
    id: z.number(),
    title: z.string(),
    date: z.date(),
    description: z.string(),
    details: z.array(z.object({
      id: z.number(),
      description: z.string(),
      type: z.nativeEnum(ChangelogDetailType),
    })),
    isVisible: z.boolean().optional(),
  }).array(),
  nextCursor: z.number().optional()
})

export const last5ChangelogSchema = z.object({
  lastViewedDate: z.string().datetime(),
})

export const getChangelogEntrySchema = z.object({
  id: z.number().int(),
});

export const changelogEntrySchema = z.object({
  id: z.number().int().optional(),
  date: z.date(),
  title: z.string(),
  description: z.string(),
  details: z.object({
    type: z.nativeEnum(ChangelogDetailType),
    description: z.string(),
  }).array(),
  isVisible: z.boolean(),
});
