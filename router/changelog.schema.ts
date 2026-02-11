import { ChangelogDetailType } from "@/prisma/generated/enums";
import { z } from "zod";
import { paginatedSchema } from "./general.schema";

export const paginatedChangelogSchema = paginatedSchema;

export const paginatedChangelogOutputSchema = z.object({
	entries: z
		.object({
			id: z.number(),
			title: z.string(),
			date: z.date(),
			description: z.string(),
			details: z.array(
				z.object({
					id: z.number(),
					description: z.string(),
					type: z.nativeEnum(ChangelogDetailType),
				})
			),
			isVisible: z.boolean().optional(),
		})
		.array(),
	nextCursor: z.number().optional(),
});

export const last5ChangelogSchema = z.object({
	lastViewedDate: z.string().datetime(),
});

export const getChangelogEntrySchema = z.object({
	id: z.number().int(),
});

export const changelogEntrySchema = z.object({
	id: z.number().int().optional(),
	date: z.date(),
	title: z.string(),
	description: z.string(),
	details: z
		.object({
			type: z.nativeEnum(ChangelogDetailType),
			description: z.string().min(1).max(255),
		})
		.array(),
	isVisible: z.boolean(),
});
