import { CELL_COUNT_PER_LINE, GRID_SIZE, PADDING } from "./constants";
import { type ResolutionConfig, getResolutionConfig } from "./resolutions";
import type {
	CellInfo,
	CellPosition,
	ColorCategory,
	PixelCoordinate,
	Region,
	Resolution,
} from "./types";
import { type ImageProcessor, rgbToHsl } from "./utils";

const generateLineCellPositions = (
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
 * Classifies a color based on HSL values with constraints
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @param contains - Constraint that limits classification to "blue" or "red"
 * @returns "unknown" | "pending" | "failure" | "success"
 */
function classifyColor(
	h: number,
	s: number,
	l: number,
	contains: "blue" | "red",
): ColorCategory {
	// Normalize hue to 0-360 range
	const normalizedHue = ((h % 360) + 360) % 360;

	// Black -> Pending: Very low lightness (≤3%) OR (high saturation ≥70% AND low lightness ≤14%)
	if (l <= 3 || (s >= 70 && l <= 14)) {
		return "pending";
	}

	// Gray -> Failure: Low saturation with any lightness above black threshold
	if (s <= 25 && l < 70) {
		return "failure";
	}

	// Red classification rules

	// Normal: 355-0-7 30-65 24-60
	const isRedNormal =
		(normalizedHue >= 355 || normalizedHue <= 7) &&
		s >= 30 &&
		s <= 65 &&
		l >= 24 &&
		l <= 60;
	// Milestone: 10-20 57-77 55-87
	const isRedMilestone =
		normalizedHue >= 10 &&
		normalizedHue <= 20 &&
		s >= 57 &&
		s <= 77 &&
		l >= 55 &&
		l <= 87;
	const isRedRange = isRedNormal || isRedMilestone;

	// Blue classification rules
	// Normal: 185-203 31-62 35-54
	const isBlueNormal =
		normalizedHue >= 185 &&
		normalizedHue <= 203 &&
		s >= 31 &&
		s <= 62 &&
		l >= 35 &&
		l <= 54;
	// Milestone:  183-205 75-85 55-70
	const isBlueMilestone =
		normalizedHue >= 183 &&
		normalizedHue <= 205 &&
		s >= 75 &&
		s <= 85 &&
		l >= 55 &&
		l <= 70;
	const isBlueRange = isBlueNormal || isBlueMilestone;

	// Apply constraints based on the 'contains' parameter
	if (contains === "red") {
		// Can only classify as success (red), pending (black), failure (gray), or unknown
		if (isRedRange) {
			return "success";
		}
	} else if (contains === "blue") {
		// Can only classify as success (blue), pending (black), failure (gray), or unknown
		if (isBlueRange) {
			return "success";
		}
	}

	// If no specific classification matches or constraints prevent classification
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
			const lineType = getLineType(line);

			// Use the optimized getColorAverage method
			const [avgR, avgG, avgB] = imgProcessor.getColorAverage(x, y, GRID_SIZE);

			// Convert to HSL and classify
			const [h, s, l] = rgbToHsl(avgR, avgG, avgB);
			const detectedClassification = classifyColor(h, s, l, lineType);

			return {
				line,
				pos,
				detectedStatus: detectedClassification,
				rgb: [avgR, avgG, avgB],
				hsl: [h, s, l],
			};
		});
	}
}
