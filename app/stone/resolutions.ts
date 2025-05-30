import type { Region } from "@/lib/utils";
import { z } from "zod";
import ResData from "./resolutions.json";

const resolutionConfSchema = z.object({
	line1: z.object({
		baseX: z.number(),
		y: z.number(),
	}),
	line2: z.object({
		baseX: z.number(),
		y: z.number(),
	}),
	line3: z.object({
		baseX: z.number(),
		y: z.number(),
	}),
	successRateRegion: z.object({
		x: z.number(),
		y: z.number(),
		width: z.number(),
		height: z.number(),
	}),
	spacing: z.number(),
});

const resolutionConfFileSchema = z.record(z.string(), resolutionConfSchema);

export type ResolutionConfig = z.infer<typeof resolutionConfSchema>;

const parsedConfig = resolutionConfFileSchema.parse(ResData);

export const resolutionConfigs: Map<string, ResolutionConfig> = new Map(
	Object.entries(parsedConfig).map(([key, value]) => [key, value]),
);
