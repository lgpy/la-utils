export interface PixelCoordinate {
	x: number;
	y: number;
}

interface CellIdentifier {
	line: number;
	pos: number;
}

export interface CellPosition extends PixelCoordinate, CellIdentifier {}

export interface CellInfo extends CellIdentifier {
	detectedStatus: string;
	isMatch: boolean; //TODO what is the purpose of this field?
	rgbColor: {
		r: number;
		g: number;
		b: number;
	};
}

export type Cell = CellPosition & CellInfo;

export interface StoneState {
	line1: string[];
	line2: string[];
	line3: string[];
	percentage: number;
}
