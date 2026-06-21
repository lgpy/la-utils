import { Class, Difficulty, TaskType } from "@/prisma/generated/enums";
import * as v from 'valibot';

export const zodTask = v.object({
	id: v.string(),
	name: v.string(),
	type: v.enum(TaskType),
	timesToComplete: v.pipe(v.number(), v.minValue(1)),
});

export const zodChar = v.object({
	id: v.string(),
	name: v.string(),
	class: v.enum(Class),
	itemLevel: v.number(),
	isGoldEarner: v.boolean(),
	isSpacer: v.optional(v.boolean()),
	assignedRaids: v.record(
		v.string(),
		v.record(
			v.string(),
			v.object({
				difficulty: v.enum(Difficulty),
				completedDate: v.optional(v.number()),
			})
		)
	),
	tasks: v.array(v.object({
		id: v.string(),
		completions: v.number(),
		completionDate: v.optional(v.number()),
	}))
});
