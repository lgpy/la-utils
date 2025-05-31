import { z } from "zod";
import ResData from "./resolutions.json";
import type { CellPosition, PixelCoordinate, Resolution } from "./types";
import { CELL_COUNT_PER_LINE } from "./constants";

function generateLineCellPositions(
	baseX: number,
	y: number,
	count: number,
	spacing: number,
): PixelCoordinate[] {
	return Array.from({ length: count }, (_, i) => ({
		x: baseX + i * spacing,
		y,
	}));
}

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

const parsedConfig = resolutionConfFileSchema.parse(ResData);

class ResolutionConfigs {
	private resolutionConfigs: Map<string, ResolutionConfig>;

	constructor(resolutionConfigs: Map<string, ResolutionConfig>) {
		this.resolutionConfigs = resolutionConfigs;
	}

	get(resolution: Resolution): ResolutionConfig | undefined {
		return this.resolutionConfigs.get(
			`${resolution.width}x${resolution.height}`,
		);
	}
}

type ResolutionConfigData = z.infer<typeof resolutionConfSchema>;

class ResolutionConfig implements ResolutionConfigData {
	line1: ResolutionConfigData["line1"];
	line2: ResolutionConfigData["line2"];
	line3: ResolutionConfigData["line3"];
	successRateRegion: ResolutionConfigData["successRateRegion"];
	spacing: number;

	constructor(data: ResolutionConfigData) {
		this.line1 = data.line1;
		this.line2 = data.line2;
		this.line3 = data.line3;
		this.successRateRegion = data.successRateRegion;
		this.spacing = data.spacing;
	}

	generateCells(): CellPosition[] {
		const line1CellPositions = generateLineCellPositions(
			this.line1.baseX,
			this.line1.y,
			CELL_COUNT_PER_LINE,
			this.spacing,
		);
		const line2CellPositions = generateLineCellPositions(
			this.line2.baseX,
			this.line2.y,
			CELL_COUNT_PER_LINE,
			this.spacing,
		);
		const line3CellPositions = generateLineCellPositions(
			this.line3.baseX,
			this.line3.y,
			CELL_COUNT_PER_LINE,
			this.spacing,
		);

		return [
			...line1CellPositions.map((pos, index) => ({
				line: 1,
				pos: index,
				x: pos.x,
				y: pos.y,
			})),
			...line2CellPositions.map((pos, index) => ({
				line: 2,
				pos: index,
				x: pos.x,
				y: pos.y,
			})),
			...line3CellPositions.map((pos, index) => ({
				line: 3,
				pos: index,
				x: pos.x,
				y: pos.y,
			})),
		];
	}
}

const resolutionConfigs = new ResolutionConfigs(
	new Map(
		Object.entries(parsedConfig).map(([key, value]) => [
			key,
			new ResolutionConfig(value),
		]),
	),
);

export { resolutionConfigs, type ResolutionConfig };
