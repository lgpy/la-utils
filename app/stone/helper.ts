import type { Region, Resolution } from "@/lib/utils";
import type { PixelCoordinate, CellPosition, CellInfo } from "./types";
import { type ImageProcessor, rgbToHsl } from "./utils";
import { SPIRAL_OFFSETS_5X5 } from "./constants";

const CELL_COUNT_PER_LINE = 10;

const PADDING = 6;

interface ResolutionConfig {
	line1: {
		baseX: number;
		y: number;
	};
	line2: {
		baseX: number;
		y: number;
	};
	line3: {
		baseX: number;
		y: number;
	};
	successRateRegion: Region;
	spacing: number;
}

const resolutionConfigs: Map<string, ResolutionConfig> = new Map();

resolutionConfigs.set("1920x1080", {
	line1: {
		baseX: 746,
		y: 384,
	},
	line2: {
		baseX: 745,
		y: 477,
	},
	line3: {
		baseX: 745,
		y: 605,
	},
	successRateRegion: {
		x: 1185,
		y: 310,
		width: 46,
		height: 27,
	},
	spacing: 38,
});

export const generateLineCellPositions = (
	baseX: number,
	y: number,
	count: number,
	spacing: number,
): PixelCoordinate[] => {
	return Array.from({ length: count }, (_, i) => ({
		x: baseX + i * spacing,
		y,
	}));
};

function getResolutionConfig(resolution: Resolution) {
	return resolutionConfigs.get(`${resolution.width}x${resolution.height}`);
}

function generateCells(config: ResolutionConfig): CellPosition[] {
	const line1CellPositions = generateLineCellPositions(
		config.line1.baseX,
		config.line1.y,
		CELL_COUNT_PER_LINE,
		config.spacing,
	);
	const line2CellPositions = generateLineCellPositions(
		config.line2.baseX,
		config.line2.y,
		CELL_COUNT_PER_LINE,
		config.spacing,
	);
	const line3CellPositions = generateLineCellPositions(
		config.line3.baseX,
		config.line3.y,
		CELL_COUNT_PER_LINE,
		config.spacing,
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

/**
 * Differentiates a pixel's color based on its RGB values.
 *
 * @param   Number  h       The hue component (0-360 degrees)
 * @param   Number  s       The saturation component (0-1)
 * @param   Number  l       The lightness component (0-1)
 * @return  String          The name of the color category
 */
export function classifyPixelColor(h: number, s: number, l: number) {
	// 1. Black (very low lightness, low saturation)
	if (s > 0.9 && l < 0.15) {
		return "black";
	}

	// 2. Grey (low saturation, not black, not overly light)
	if (s < 0.2 && l >= 0.1 && l < 0.75) {
		return "grey";
	}

	// 3. Red (includes peachy/salmon tones)
	if (((h >= 0 && h < 30) || (h >= 330 && h <= 360)) && s > 0.25 && l > 0.2) {
		return "red";
	}

	// 4. Turquoise/Light Blue (includes light teals)
	if (h >= 160 && h <= 220 && s > 0.3 && l >= 0.35) {
		return "blue";
	}

	// 5. Dark Blue (lower lightness blues)
	if (h >= 190 && h <= 260 && s > 0.35 && l < 0.35 && l > 0.05) {
		return "blue";
	}

	return null; // If none of the above categories match
}

export class StoneHelper {
	private cells: CellPosition[] = [];
	private resolution: Resolution;
	private config: ResolutionConfig;

	constructor(resolution: Resolution) {
		const config = getResolutionConfig(resolution);
		if (config === undefined) {
			throw new Error(
				`No resolution config found for ${resolution.width}x${resolution.height}.`,
			);
		}
		this.resolution = resolution;
		this.config = config;
		this.cells = generateCells(this.config);
	}

	getCells(): CellPosition[] {
		return this.cells;
	}

	getResolution(): Resolution {
		return this.resolution;
	}

	getCellsCropRegion(): Region {
		if (this.cells.length === 0) {
			throw new Error("No cells provided to calculate crop region.");
		}

		const minX = Math.min(...this.cells.map((t) => t.x));
		const minY = Math.min(...this.cells.map((t) => t.y));
		const maxX = Math.max(...this.cells.map((t) => t.x));
		const maxY = Math.max(...this.cells.map((t) => t.y));

		const x = Math.max(0, minX - PADDING);
		const y = Math.max(0, minY - PADDING);
		const width = Math.max(1, maxX + PADDING - x);
		const height = Math.max(1, maxY + PADDING - y);

		return { x, y, width, height };
	}

	getSuccessRateRegion(): Region {
		return this.config.successRateRegion;
	}

	parseCellsInfo(imgProcessor: ImageProcessor): CellInfo[] {
		return this.cells.map((cell) => {
			const { x, y, pos, line } = cell;
			let finalRgb = { r: 0, g: 0, b: 0 };
			let detectedClassification: string | null = null;
			let pixelFound = false;

			for (const offset of SPIRAL_OFFSETS_5X5) {
				const checkX = x + offset.dx;
				const checkY = y + offset.dy;
				const [r, g, b] = imgProcessor.getPixel(checkX, checkY);
				const [h, s, l] = rgbToHsl(r, g, b);
				const classification = classifyPixelColor(h, s, l);
				if (classification !== null) {
					detectedClassification = classification;
					finalRgb = { r, g, b };
					pixelFound = true;
					break;
				}
			}
			let finalStatus: string;

			if (
				(cell.line === 1 || cell.line === 2) &&
				detectedClassification === "blue"
			)
				finalStatus = "success";
			else if (cell.line === 3 && detectedClassification === "red")
				finalStatus = "success";
			else if (detectedClassification === "grey") finalStatus = "failure";
			else if (detectedClassification === "black") finalStatus = "pending";
			else finalStatus = "unknown";

			return {
				line,
				pos,
				isMatch: pixelFound,
				detectedStatus: finalStatus,
				rgbColor: finalRgb,
			};
		});
	}
}
