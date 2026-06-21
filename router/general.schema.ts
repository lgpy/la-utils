import * as v from 'valibot';

export const paginatedSchema = v.object({
	limit: v.optional(
		v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(100)),
		10
	),
	cursor: v.optional(
		v.pipe(v.number(), v.integer(), v.minValue(0)),
		0
	),
});
