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

	// Apply constraints based on the 'contains' parameter
	if (contains === "red") {
		//* Red Normal Constraints: H 355-0-7 | S 24-65 | L 24-60
		const isRedNormal =
			(H >= 355 || H <= 7) && S >= 24 && S <= 65 && L >= 24 && L <= 60;
		//* Red Milestone Constraints: H 10-20 | S 57-82 | L 55-87
		const isRedMilestone =
			H >= 10 && H <= 20 && S >= 57 && S <= 82 && L >= 50 && L <= 87;
		const isRedRange = isRedNormal || isRedMilestone;

		if (isRedRange) {
			return "success";
		}
	} else if (contains === "blue") {
		//* Blue Normal Constraints: H 185-203 | S 31-64 | L 35-54
		const isBlueNormal =
			H >= 185 && H <= 203 && S >= 31 && S <= 64 && L >= 35 && L <= 54;
		//* Blue Milestone Constraints:  H 183-205 | S 75-92 | L 55-70
		const isBlueMilestone =
			H >= 183 && H <= 205 && S >= 75 && S <= 95 && L >= 52 && L <= 70;
		const isBlueRange = isBlueNormal || isBlueMilestone;

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
