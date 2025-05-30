export const GRID_SIZE = 5;
if (GRID_SIZE % 2 === 0) {
	throw new Error(`GRID_SIZE must be odd, but got ${GRID_SIZE}`);
}

export const CELL_COUNT_PER_LINE = 10;

export const PADDING = 6;
