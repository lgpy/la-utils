import { cn, type Region } from "@/lib/utils";
import { SPIRAL_OFFSETS_5X5 } from "./constants";
import type { CellPosition, StoneState } from "./types";
import { StoneHelper } from "./helper";

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation [h_degrees, s_0_to_1, l_0_to_1]
 */
export function rgbToHsl(r: number, g: number, b: number) {
	r /= 255;
	g /= 255;
	b /= 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h: number | undefined;
	let s: number | undefined;
	const l = (max + min) / 2;

	if (max === min) {
		h = s = 0; // achromatic
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		if (h === undefined) h = 0; // Should ideally not happen if max !== min
		h /= 6;
	}

	return [h * 360, s, l]; // Return H in degrees (0-360), S and L as 0-1
}

export const getColorClasses = (
	status: string | undefined,
	isBlueLine: boolean,
) => ({
	background: cn("", {
		"bg-red": status === "success" && !isBlueLine,
		"bg-blue": status === "success" && isBlueLine,
		"bg-surface2": status === "failure",
	}),
});

export function PredictPercentage(
	oldState: StoneState,
	newState: Omit<StoneState, "percentage">,
): number | null {
	const oldCount = { failures: 0, successes: 0 };
	const newCount = { failures: 0, successes: 0 };

	const statusChecker = (
		status: string,
		obj: { failures: number; successes: number },
	) => {
		switch (status) {
			case "success":
				obj.successes++;
				break;
			case "failure":
				obj.failures++;
				break;
			default:
				break;
		}
	};

	for (const status of oldState.line1) statusChecker(status, oldCount);
	for (const status of oldState.line2) statusChecker(status, oldCount);
	for (const status of oldState.line3) statusChecker(status, oldCount);
	for (const status of newState.line1) statusChecker(status, newCount);
	for (const status of newState.line2) statusChecker(status, newCount);
	for (const status of newState.line3) statusChecker(status, newCount);

	const totalOld = oldCount.successes + oldCount.failures;
	const totalNew = newCount.successes + newCount.failures;
	const totaldiff = totalNew - totalOld;

	if (totaldiff === 0) return oldState.percentage; // No change in total, return old percentage

	if (totaldiff === 1 && newCount.successes > oldCount.successes) {
		// If one more success, increase percentage by 10%
		return Math.min(oldState.percentage + 10, 75);
	}

	if (totaldiff === 1 && newCount.failures > oldCount.failures) {
		// If one more failure, decrease percentage by 10%
		return Math.max(oldState.percentage - 10, 25);
	}

	console.debug(
		`PredictPercentage: Unexpected totaldiff: ${totaldiff}, oldCount: ${JSON.stringify(oldCount)}, newCount: ${JSON.stringify(newCount)}`,
	);
	return null;
}

export class ImageProcessor {
	constructor(
		private ctx: CanvasRenderingContext2D,
		private region: Region | undefined,
	) {}

	static async fromImageBitmap(
		imageBitmap: ImageBitmap,
		cropRegion?: Region,
	): Promise<ImageProcessor> {
		const canvas = document.createElement("canvas");
		canvas.width = cropRegion?.width ?? imageBitmap.width;
		canvas.height = cropRegion?.height ?? imageBitmap.height;
		const ctx = canvas.getContext("2d", { willReadFrequently: true });
		if (ctx === null) {
			throw new Error("Could not get 2D context from canvas");
		}
		ctx.drawImage(
			imageBitmap,
			cropRegion?.x ?? 0,
			cropRegion?.y ?? 0,
			cropRegion?.width ?? imageBitmap.width,
			cropRegion?.height ?? imageBitmap.height,
			0,
			0,
			canvas.width,
			canvas.height,
		);
		return new ImageProcessor(ctx, cropRegion);
	}

	getDataUrl(type = "image/png", quality?: number): string {
		return this.ctx.canvas.toDataURL(type, quality);
	}

	getCanvas(): HTMLCanvasElement {
		return this.ctx.canvas;
	}

	getWidth(): number {
		return this.ctx.canvas.width;
	}
	getHeight(): number {
		return this.ctx.canvas.height;
	}

	getPixel(x: number, y: number) {
		// If there's a crop region, adjust coordinates
		const adjustedX = this.region ? x - this.region.x : x;
		const adjustedY = this.region ? y - this.region.y : y;

		// Ensure coordinates are within bounds
		if (
			adjustedX < 0 ||
			adjustedY < 0 ||
			adjustedX >= this.ctx.canvas.width ||
			adjustedY >= this.ctx.canvas.height
		) {
			throw new Error(
				`Coordinates (${adjustedX}, ${adjustedY}) are out of the bound ${JSON.stringify(this.region)}`,
			);
		}
		const pixelData = this.ctx.getImageData(adjustedX, adjustedY, 1, 1).data;
		return [pixelData[0], pixelData[1], pixelData[2]];
	}
}
