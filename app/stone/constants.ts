import { isMatch } from "lodash";
import { detect } from "tesseract.js";
import type { PixelCoordinate, PixelTarget } from "./types";

// Constants for target generation
export const LINE_1_BASE_X = 746;
export const LINE_1_Y = 384;
export const LINE_2_BASE_X = 745;
export const LINE_2_Y = 477;
export const LINE_3_BASE_X = 745;
export const LINE_3_Y = 605;
export const SPACING = 38;
export const TARGET_COUNT_PER_LINE = 10;

export const generateLinePositions = (
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

const line1Positions = generateLinePositions(
	LINE_1_BASE_X,
	LINE_1_Y,
	TARGET_COUNT_PER_LINE,
	SPACING,
);
const line2Positions = generateLinePositions(
	LINE_2_BASE_X,
	LINE_2_Y,
	TARGET_COUNT_PER_LINE,
	SPACING,
);
const line3Positions = generateLinePositions(
	LINE_3_BASE_X,
	LINE_3_Y,
	TARGET_COUNT_PER_LINE,
	SPACING,
);

export const PREDEFINED_TARGETS: PixelTarget[] = [
	...line1Positions.map((pos, index) => ({
		id: crypto.randomUUID(),
		name: `L1-P${index + 1}`,
		successString: "blue" as const,
		x: pos.x,
		y: pos.y,
		line: 1,
		isMatch: false,
		detectedStatus: "unknown",
	})),
	...line2Positions.map((pos, index) => ({
		id: crypto.randomUUID(),
		name: `L2-P${index + 1}`,
		successString: "blue" as const,
		x: pos.x,
		y: pos.y,
		line: 2,
		isMatch: false,
		detectedStatus: "unknown",
	})),
	...line3Positions.map((pos, index) => ({
		id: crypto.randomUUID(),
		name: `L3-P${index + 1}`,
		successString: "red" as const,
		x: pos.x,
		y: pos.y,
		line: 3,
		isMatch: false,
		detectedStatus: "unknown",
	})),
];

export const G_GRID_SIZE = 4;
export const PADDING = 6;

let minTargetX = Number.POSITIVE_INFINITY,
	minTargetY = Number.POSITIVE_INFINITY,
	maxTargetX = Number.NEGATIVE_INFINITY,
	maxTargetY = Number.NEGATIVE_INFINITY;

if (PREDEFINED_TARGETS.length > 0) {
	PREDEFINED_TARGETS.forEach((target) => {
		minTargetX = Math.min(minTargetX, target.x);
		minTargetY = Math.min(minTargetY, target.y);
		maxTargetX = Math.max(maxTargetX, target.x);
		maxTargetY = Math.max(maxTargetY, target.y);
	});
} else {
	minTargetX = 0;
	minTargetY = 0;
	maxTargetX = 100;
	maxTargetY = 100;
}

export const CROP_X = Math.max(0, minTargetX - PADDING);
export const CROP_Y = Math.max(0, minTargetY - PADDING);
export const CROP_WIDTH = Math.max(1, maxTargetX + PADDING - CROP_X);
export const CROP_HEIGHT = Math.max(1, maxTargetY + PADDING - CROP_Y);

export function getSpiralOffsets(
	gridSize: number,
): { dx: number; dy: number }[] {
	const halfSize = Math.floor(gridSize / 2);
	const offsets: { dx: number; dy: number }[] = [];
	const visited = new Set<string>();
	offsets.push({ dx: 0, dy: 0 });
	visited.add("0,0");
	if (gridSize > 1) {
		let curX = 0,
			curY = 0,
			dirX = 1,
			dirY = 0,
			legLength = 1,
			stepsInLeg = 0,
			turnsMade = 0;
		while (offsets.length < gridSize * gridSize) {
			curX += dirX;
			curY += dirY;
			const coordStr = `${curX},${curY}`;
			if (Math.abs(curX) <= halfSize && Math.abs(curY) <= halfSize) {
				if (!visited.has(coordStr)) {
					offsets.push({ dx: curX, dy: curY });
					visited.add(coordStr);
				}
			} else if (legLength > gridSize * 2) {
				console.warn("Spiral out of bounds");
				break;
			}
			if (offsets.length >= gridSize * gridSize) break;
			stepsInLeg++;
			if (stepsInLeg === legLength) {
				stepsInLeg = 0;
				const prevDirX = dirX;
				dirX = dirY;
				dirY = -prevDirX;
				turnsMade++;
				if (turnsMade % 2 === 0) legLength++;
			}
		}
	}
	return offsets;
}

export const SPIRAL_OFFSETS_5X5 = getSpiralOffsets(G_GRID_SIZE);
