import { ChangelogDetailType } from "@/prisma/generated/enums";
import * as v from 'valibot';
import { paginatedSchema } from "./general.schema";

export const paginatedChangelogSchema = paginatedSchema;

export const paginatedChangelogOutputSchema = v.object({
	entries:
		v.array(
			v.object({
				id: v.number(),
				title: v.string(),
				date: v.date(),
				description: v.string(),
				details: v.array(
					v.object({
						id: v.number(),
						description: v.string(),
						type: v.enum(ChangelogDetailType),
					})
				),
				isVisible: v.optional(v.boolean()),
			})
		),
	nextCursor: v.optional(v.number()),
});

export const last5ChangelogSchema = v.object({
	lastViewedDate: v.pipe(v.string(), v.isoDateTime()),
});

export const getChangelogEntrySchema = v.object({
	id: v.pipe(v.number(), v.integer()),
});

export const changelogEntrySchema = v.object({
	id: v.optional(v.pipe(v.number(), v.integer())),
	date: v.date(),
	title: v.string(),
	description: v.string(),
	details: v.array(v.object({
		type: v.enum(ChangelogDetailType),
		description: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
	})),
	isVisible: v.boolean(),
});
