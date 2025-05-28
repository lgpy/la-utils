const G_GRID_SIZE = 4;

function getSpiralOffsets(gridSize: number): { dx: number; dy: number }[] {
	const halfSize = Math.floor(gridSize / 2);
	const offsets: { dx: number; dy: number }[] = [];
	const visited = new Set<string>();
	offsets.push({ dx: 0, dy: 0 });
	visited.add("0,0");
	if (gridSize > 1) {
		let curX = 0;
		let curY = 0;
		let dirX = 1;
		let dirY = 0;
		let legLength = 1;
		let stepsInLeg = 0;
		let turnsMade = 0;
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
