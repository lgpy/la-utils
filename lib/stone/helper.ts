import { GRID_SIZE, PADDING } from "./constants";
import { type ResolutionConfig, resolutionConfigs } from "./resolutions";
import type {
	CellInfo,
	CellPosition,
	ColorCategory,
	Region,
	Resolution,
} from "./types";
import { type ImageProcessor, rgbToHsl } from "./utils";

/**
 * Classifies a color based on HSL values with constraints
 * @param _H - Hue (0-360)
 * @param S - Saturation (0-100)
 * @param L - Lightness (0-100)
 * @param contains - Constraint that limits classification to "blue" or "red"
 * @returns "unknown" | "pending" | "failure" | "success"
 */
function classifyColor(
	_H: number,
	S: number,
	L: number,
	contains: "blue" | "red",
): ColorCategory {
	// Normalize hue to 0-360 range
	const H = ((_H % 360) + 360) % 360;

	// Black -> Pending: Very low lightness (≤3%) OR (high saturation ≥70% AND low lightness ≤14%)
	if (L <= 3 || (S >= 70 && L <= 14)) {
		return "pending";
	}

	// Gray -> Failure: Low saturation with any lightness above black threshold
	if (S <= 25 && L < 70) {
		return "failure";
	}
	if (contains === "red") {
		const isRed = H >= 0 && H <= 4 && S >= 26 && S <= 72 && L >= 21 && L <= 54;
		const isRedMilestone = H >= 11 && H <= 18 && S >= 60 && S <= 77 && L >= 51 && L <= 82;

		if (isRed || isRedMilestone) {
			return "success";
		}
	} else if (contains === "blue") {
		const isBlue = H >= 185 && H <= 195 && S >= 41 && S <= 67 && L >= 35 && L <= 48;
		const isBlueMilestone = H >= 187 && H <= 200 && S >= 72 && S <= 87 && L >= 62 && L <= 74;

		if (isBlue || isBlueMilestone) {
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
		const config = resolutionConfigs.get(resolution);
		if (config === undefined) {
			throw new Error(
				`No resolution config found for ${resolution.width}x${resolution.height}.`,
			);
		}
		this.resolution = resolution;
		this.config = config;
		this.cells = this.config.generateCells();
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
			const [avgR, avgG, avgB] = imgProcessor.getColorAverageDiamond(x, y, 5);

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
