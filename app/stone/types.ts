export interface PixelCoordinate {
	x: number;
	y: number;
}

export interface PixelTarget {
	id: string;
	name: string;
	x: number;
	y: number;
	line: number;
	isMatch: boolean;
	detectedStatus: string;
}

export interface StoneState {
	line1: string[];
	line2: string[];
	line3: string[];
	percentage: number;
}
