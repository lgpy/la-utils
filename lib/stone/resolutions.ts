import * as v from 'valibot';
import { CELL_COUNT_PER_LINE } from "./constants";
import ResData from "./resolutions.json";
import type { CellPosition, PixelCoordinate, Resolution } from "./types";

function generateLineCellPositions(
	baseX: number,
	y: number,
	count: number,
	spacing: number
): PixelCoordinate[] {
	return Array.from({ length: count }, (_, i) => ({
		x: baseX + Math.round(i * spacing),
		y,
	}));
}

const resolutionConfSchema = v.object({
	line1: v.object({
		baseX: v.number(),
		y: v.number(),
	}),
	line2: v.object({
		baseX: v.number(),
		y: v.number(),
	}),
	line3: v.object({
		baseX: v.number(),
		y: v.number(),
	}),
	successRateRegion: v.object({
		x: v.number(),
		y: v.number(),
		width: v.number(),
		height: v.number(),
	}),
	spacing: v.number(),
});

const resolutionConfFileSchema = v.record(v.string(), resolutionConfSchema);

const parsedConfig = v.parse(resolutionConfFileSchema, ResData);

class ResolutionConfigs {
	private resolutionConfigs: Map<string, ResolutionConfig>;

	constructor(resolutionConfigs: Map<string, ResolutionConfig>) {
		this.resolutionConfigs = resolutionConfigs;
	}

	getSupportedResolutions(): [number, number][] {
		return Array.from(this.resolutionConfigs.keys()).map((key) => {
			const [width, height] = key.split("x").map(Number);
			return [width, height];
		});
	}

	get(resolution: Resolution): ResolutionConfig | undefined {
		return this.resolutionConfigs.get(
			`${resolution.width}x${resolution.height}`
		);
	}
}

type ResolutionConfigData = v.InferOutput<typeof resolutionConfSchema>;

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
			this.spacing
		);
		const line2CellPositions = generateLineCellPositions(
			this.line2.baseX,
			this.line2.y,
			CELL_COUNT_PER_LINE,
			this.spacing
		);
		const line3CellPositions = generateLineCellPositions(
			this.line3.baseX,
			this.line3.y,
			CELL_COUNT_PER_LINE,
			this.spacing
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
		])
	)
);

export { resolutionConfigs, type ResolutionConfig };
