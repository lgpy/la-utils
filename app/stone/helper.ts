import type { Region, Resolution } from "@/lib/utils";
import type {
	PixelCoordinate,
	CellPosition,
	CellInfo,
	ColorCategory,
} from "./types";
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

resolutionConfigs.set("1870x1078", {
	line1: {
		baseX: 727,
		y: 400,
	},
	line2: {
		baseX: 726,
		y: 490,
	},
	line3: {
		baseX: 727,
		y: 615,
	},
	successRateRegion: {
		x: 1155,
		y: 331,
		width: 39,
		height: 19,
	},
	spacing: 37,
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

export function classifyPixelColor(
	h: number,
	s: number,
	l: number,
	lineType: "blue" | "red",
): ColorCategory {
	// 1. Black (very low lightness, low saturation)
	if (s > 0.9 && l < 0.15) {
		return "pending";
	}

	// 2. Grey (low saturation, not black, not overly light)
	if (s < 0.2 && l >= 0.1 && l < 0.75) {
		return "failure";
	}

	// 3. Red (includes peachy/salmon tones)
	if (
		lineType === "red" &&
		((h >= 0 && h < 30) || (h >= 330 && h <= 360)) &&
		s > 0.25 &&
		l > 0.2
	) {
		return "success";
	}

	// 4. Turquoise/Light Blue (includes light teals)
	if (lineType === "blue" && h >= 160 && h <= 220 && s > 0.3 && l >= 0.35) {
		return "success";
	}

	// 5. Dark Blue (lower lightness blues)
	if (
		lineType === "blue" &&
		h >= 190 &&
		h <= 260 &&
		s > 0.35 &&
		l < 0.35 &&
		l > 0.05
	) {
		return "success";
	}

	return "unknown"; // If none of the above categories match
}

function classifyPixelColorV2(
	h: number,
	s: number,
	l: number,
	lineType: "blue" | "red",
): ColorCategory {
	// Normalize hue 360 to 0 for easier range checks if necessary, though current logic handles it.
	const normalizedH = h === 360 ? 0 : h;

	// 1. Check for Pending (very low lightness is a strong indicator)
	if (l < 0.15) {
		// Adjusted from l < 15
		// Pending can have reddish hues (around 0/360) or cyanish hues
		const isPendingReddishHue = normalizedH >= 340 || normalizedH <= 20;
		const isPendingCyanishHue = normalizedH >= 190 && normalizedH <= 215;

		if (isPendingReddishHue || isPendingCyanishHue) {
			return "pending";
		}
	}

	// 2. Check for Fail (typically desaturated, specific blue/cyan hue, mid-low lightness)
	// Must not be pending (implicit: l >= 0.15 for this check to be significant for fail)
	if (s < 0.2) {
		// Adjusted from s < 20 (Very low saturation)
		if (normalizedH >= 200 && normalizedH <= 220) {
			// Fail hue range
			if (l >= 0.15 && l <= 0.5) {
				// Adjusted from l >= 15 && l <= 50 (Fail lightness range)
				return "failure";
			}
		}
	}

	// 3. Check for Red
	// Must not be pending (implicit: l >= 0.15)
	// Must not be fail (implicit: s >= 0.20 for this check to be significant for red)
	const isGeneralRedHue = normalizedH >= 330 || normalizedH <= 40;
	if (isGeneralRedHue && lineType === "red") {
		// Ensure it's not too dark (already pending) and has enough saturation/lightness to be perceived as red
		if (s > 0.3 && l > 0.2) {
			// Adjusted from s > 30 && l > 20
			return "success";
		}
	}

	// 4. Check for Blue
	// Must not be pending (implicit: l >= 0.15)
	// Must not be fail (implicit: s >= 0.20)
	// Must not be red (hue ranges are mostly distinct, order helps)
	const isGeneralBlueHue = normalizedH >= 175 && normalizedH <= 230;
	if (isGeneralBlueHue && lineType === "blue") {
		// Ensure it's not too dark (pending), not too desaturated (fail), and has enough saturation/lightness
		if (s > 0.4 && l > 0.25) {
			// Adjusted from s > 40 && l > 25
			return "success";
		}
	}

	return "unknown";
}

function getLineType(line: number): "blue" | "red" {
	if (line === 1 || line === 2) {
		return "blue";
	}
	if (line === 3) {
		return "red";
	}
	throw new Error(`Invalid line number: ${line}. Expected 1, 2, or 3.`);
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
			let detectedClassification: ReturnType<typeof classifyPixelColor> =
				"unknown";
			const lineType = getLineType(line);

			for (const offset of SPIRAL_OFFSETS_5X5) {
				const checkX = x + offset.dx;
				const checkY = y + offset.dy;
				const [r, g, b] = imgProcessor.getPixel(checkX, checkY);
				const [h, s, l] = rgbToHsl(r, g, b);
				const classification = classifyPixelColorV2(h, s, l, lineType);
				if (classification !== "unknown") {
					detectedClassification = classification;
					finalRgb = { r, g, b };
					break;
				}
			}

			return {
				line,
				pos,
				detectedStatus: detectedClassification,
				rgbColor: finalRgb,
			};
		});
	}
}
