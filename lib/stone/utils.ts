import { cn } from "@/lib/utils";
import type { Region } from "./types";

/**
 * Converts RGB color values to HSL (Hue, Saturation, Lightness) color space.
 *
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns An array containing [hue (0-360), saturation (0-100), lightness (0-100)]
 *
 * @example
 * // Returns approximately [0, 100, 50] (pure red in HSL)
 * rgbToHsl(255, 0, 0);
 *
 * @example
 * // Returns approximately [120, 100, 50] (pure green in HSL)
 * rgbToHsl(0, 255, 0);
 */
export function rgbToHsl(r: number, g: number, b: number) {
	// biome-ignore lint/style/noParameterAssign: optimization
	r /= 255;
	// biome-ignore lint/style/noParameterAssign: optimization
	g /= 255;
	// biome-ignore lint/style/noParameterAssign: optimization
	b /= 255;
	const l = Math.max(r, g, b);
	const s = l - Math.min(r, g, b);
	const h = s
		? l === r
			? (g - b) / s
			: l === g
				? 2 + (b - r) / s
				: 4 + (r - g) / s
		: 0;
	return [
		60 * h < 0 ? 60 * h + 360 : 60 * h,
		100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
		(100 * (2 * l - s)) / 2,
	];
}

export const getColorClasses = (
	status: string | undefined,
	isBlueLine: boolean,
) => {
	return {
		background: cn("", {
			"bg-red": status === "success" && !isBlueLine,
			"bg-blue": status === "success" && isBlueLine,
			"bg-surface2": status === "failure",
			"bg-peach": status === "unknown",
		}),
	};
};

export class ImageProcessor {
	constructor(
		private ctx: CanvasRenderingContext2D,
		private region: Region | undefined,
	) { }

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

	_translateCoords(x: number, y: number): [number, number] {
		if (!this.region) return [x, y];
		return [x - this.region.x, y - this.region.y];
	}

	_verifyCoords(x: number, y: number): void {
		if (x < 0 || y < 0 || x >= this.getWidth() || y >= this.getHeight()) {
			throw new Error(
				`Coordinates (${x}, ${y}) are out of bounds for canvas size ${this.getWidth()}x${this.getHeight()}.`,
			);
		}
	}

	getPixel(x: number, y: number) {
		// If there's a crop region, adjust coordinates
		const [adjustedX, adjustedY] = this._translateCoords(x, y);
		this._verifyCoords(adjustedX, adjustedY);

		const pixelData = this.ctx.getImageData(adjustedX, adjustedY, 1, 1).data;
		return [pixelData[0], pixelData[1], pixelData[2]];
	}

	getColorAverage(
		x: number,
		y: number,
		gridSize: number,
	): [number, number, number] {
		// If there's a crop region, adjust coordinates
		const [adjustedX, adjustedY] = this._translateCoords(x, y);

		// Cache canvas dimensions to avoid repeated method calls
		const canvasWidth = this.ctx.canvas.width;
		const canvasHeight = this.ctx.canvas.height;

		// Calculate the bounds of the grid
		const halfGrid = Math.floor(gridSize / 2);
		const startX = Math.max(0, adjustedX - halfGrid);
		const startY = Math.max(0, adjustedY - halfGrid);
		const endX = Math.min(canvasWidth, adjustedX + halfGrid + 1);
		const endY = Math.min(canvasHeight, adjustedY + halfGrid + 1);

		const width = endX - startX;
		const height = endY - startY;

		// Get image data for the entire grid region
		const imageData = this.ctx.getImageData(startX, startY, width, height);
		const data = imageData.data;

		let totalR = 0;
		let totalG = 0;
		let totalB = 0;

		// Sum up all pixel values in the grid
		// We know exactly how many pixels we have: width * height
		for (let i = 0; i < data.length; i += 4) {
			totalR += data[i]; // Red
			totalG += data[i + 1]; // Green
			totalB += data[i + 2]; // Blue
		}

		// Calculate averages using known pixel count
		const pixelCount = width * height;
		const avgR = Math.round(totalR / pixelCount);
		const avgG = Math.round(totalG / pixelCount);
		const avgB = Math.round(totalB / pixelCount);

		return [avgR, avgG, avgB];
	}
}

export function parseSuccessRate(ocrString: string): number | null {
	const trimmedString = ocrString.trim();
	if (trimmedString.length === 0) return null;

	const regexRes = trimmedString.match(/^(\d{2})(?:%)?$/);

	if (regexRes === null) return null;

	const intValue = Number.parseInt(regexRes[1], 10);

	if (Number.isNaN(intValue)) return null;

	//ocrText needs to be 75 65 55 45 35 25 and optionally have % at the end
	const Acceptable_Percentages = [75, 65, 55, 45, 35, 25];
	if (!Acceptable_Percentages.includes(intValue)) return null;

	return intValue;
}
