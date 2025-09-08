import type { StoneState } from "./state";

/**
 * Defines a single victory goal condition.
 * Row 3's condition (e.g., fewer than 5 successes) is handled by r3MaxSuccessExclusive in the optimizer.
 */
export interface GoalCondition {
	r1MinSuccess: number;
	r2MinSuccess: number;
}

/**
 * Result of asking for the optimal move.
 * bestRow is 1, 2, or 3, or null if game is over or no move is advised.
 * bestProbability is the maximum expected win probability achievable from the current state by making the best move.
 */
export interface OptimalMoveResult {
	/**
	 * Expected win probabilities for attempting a move in row 1, row 2, and row 3 respectively.
	 * Values are -1 if a move in that row is not possible (e.g., row is full), or undefined if the game is over.
	 */
	rowDecisionProbabilities?: [number, number, number];
}

/**
 * Implements the Stone Game algorithm to find the optimal strategy.
 * It pre-calculates win probabilities for all reachable game states upon initialization.
 */
export class StoneGameOptimizer {
	private memo: Map<number, number>;
	private readonly goals: GoalCondition[];
	private readonly r3MaxSuccessExclusive: number;

	private readonly maxCellsPerRow: number = 10;
	private readonly totalTurns: number = 30;
	private readonly probMin: number = 25;
	private readonly probMax: number = 75;
	private readonly probStep: number = 10;

	// Pre-calculated probability values for faster lookup
	private readonly probabilities: number[];
	private readonly probabilityMap: Map<number, number>;

	/**
	 * Initializes the StoneGameOptimizer.
	 * @param goals An array of goal conditions for Rows 1 and 2.
	 * @param r3MaxSuccessExclusive The maximum number of successes allowed in Row 3 (exclusive) for a win. Defaults to 5.
	 */
	constructor(goals: GoalCondition[], r3MaxSuccessExclusive = 5) {
		this.goals = goals;
		this.r3MaxSuccessExclusive = r3MaxSuccessExclusive;

		// Initialize probability arrays for faster calculations
		this.probabilities = [];
		this.probabilityMap = new Map();
		for (let p = this.probMin; p <= this.probMax; p += this.probStep) {
			this.probabilities.push(p);
			this.probabilityMap.set(p, p / 100.0);
		}

		this.memo = new Map<number, number>();
		this._populateMemo();
	}

	private _stateToKey(
		c1: number,
		s1: number,
		c2: number,
		s2: number,
		c3: number,
		s3: number,
		prob: number
	): number {
		// Encode state as a single number for faster lookup
		// Each component fits in specific bit ranges:
		// c1, c2, c3: 0-10 (4 bits each)
		// s1, s2, s3: 0-10 (4 bits each)
		// prob: 25-75 step 10 -> 0-5 (3 bits)
		const probIndex = (prob - this.probMin) / this.probStep;
		return (
			c1 |
			(s1 << 4) |
			(c2 << 8) |
			(s2 << 12) |
			(c3 << 16) |
			(s3 << 20) |
			(probIndex << 24)
		);
	}

	private _checkVictory(s1: number, s2: number, s3: number): boolean {
		for (const goal of this.goals) {
			if (
				s1 >= goal.r1MinSuccess &&
				s2 >= goal.r2MinSuccess &&
				s3 < this.r3MaxSuccessExclusive
			) {
				return true;
			}
		}
		return false;
	}

	private _isGameLost(
		s1: number,
		s2: number,
		s3: number,
		c1: number,
		c2: number,
		// oxlint-disable-next-line no-unused-vars
		c3: number
	): boolean {
		// Early termination: check if it's impossible to win
		const remainingCellsR1 = this.maxCellsPerRow - c1;
		const remainingCellsR2 = this.maxCellsPerRow - c2;
		const maxPossibleS1 = s1 + remainingCellsR1;
		const maxPossibleS2 = s2 + remainingCellsR2;

		// Check if any goal is still achievable
		for (const goal of this.goals) {
			if (
				maxPossibleS1 >= goal.r1MinSuccess &&
				maxPossibleS2 >= goal.r2MinSuccess &&
				s3 < this.r3MaxSuccessExclusive
			) {
				return false; // Still winnable
			}
		}
		return true; // No goal is achievable
	}

	private _calculateWinProbRecursive(
		c1: number,
		s1: number, // Cells filled and successes for row 1
		c2: number,
		s2: number, // Cells filled and successes for row 2
		c3: number,
		s3: number, // Cells filled and successes for row 3
		currentProb: number
	): number {
		// Base Case: Game End (all 30 cells filled)
		if (c1 + c2 + c3 === this.totalTurns) {
			return this._checkVictory(s1, s2, s3) ? 1.0 : 0.0;
		}

		// Invalid states (should not be reached with correct logic but good for safety)
		if (
			s1 > c1 ||
			s2 > c2 ||
			s3 > c3 ||
			c1 > this.maxCellsPerRow ||
			c2 > this.maxCellsPerRow ||
			c3 > this.maxCellsPerRow
		) {
			return 0.0; // Or throw an error
		}

		// Early termination: if game is already lost
		if (this._isGameLost(s1, s2, s3, c1, c2, c3)) {
			return 0.0;
		}

		const stateKey = this._stateToKey(c1, s1, c2, s2, c3, s3, currentProb);
		const memoValue = this.memo.get(stateKey);
		if (memoValue !== undefined) {
			return memoValue;
		}

		let maxOverallWinProbIfPlayerPlaysOptimally = 0.0;

		// Pre-calculate probability values for reuse
		const probOfSuccess =
			this.probabilityMap.get(currentProb) ?? currentProb / 100.0;
		const probOfFailure = 1.0 - probOfSuccess;
		const nextProbAfterSuccess = Math.max(
			this.probMin,
			currentProb - this.probStep
		);
		const nextProbAfterFailure = Math.min(
			this.probMax,
			currentProb + this.probStep
		);

		// Try each row using a loop to reduce code duplication
		const rowStates = [
			{ c: c1, s: s1, maxCells: this.maxCellsPerRow },
			{ c: c2, s: s2, maxCells: this.maxCellsPerRow },
			{ c: c3, s: s3, maxCells: this.maxCellsPerRow },
		];

		for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
			const row = rowStates[rowIdx];
			if (row.c < row.maxCells) {
				// Calculate states after success and failure
				const successState = [c1, s1, c2, s2, c3, s3];
				const failureState = [c1, s1, c2, s2, c3, s3];

				successState[rowIdx * 2]++; // Increment cells
				successState[rowIdx * 2 + 1]++; // Increment successes
				failureState[rowIdx * 2]++; // Increment cells only

				const winProbIfSuccess = this._calculateWinProbRecursive(
					successState[0],
					successState[1],
					successState[2],
					successState[3],
					successState[4],
					successState[5],
					nextProbAfterSuccess
				);

				const winProbIfFailure = this._calculateWinProbRecursive(
					failureState[0],
					failureState[1],
					failureState[2],
					failureState[3],
					failureState[4],
					failureState[5],
					nextProbAfterFailure
				);

				const expectedWinProbForChoosingRow =
					probOfSuccess * winProbIfSuccess + probOfFailure * winProbIfFailure;

				if (
					expectedWinProbForChoosingRow >
					maxOverallWinProbIfPlayerPlaysOptimally
				) {
					maxOverallWinProbIfPlayerPlaysOptimally =
						expectedWinProbForChoosingRow;
				}
			}
		}

		this.memo.set(stateKey, maxOverallWinProbIfPlayerPlaysOptimally);
		return maxOverallWinProbIfPlayerPlaysOptimally;
	}

	private _populateMemo(): void {
		// Initial call to fill the memo table for all reachable states, starting with 75% probability.
		// We need to iterate through all possible starting probabilities because the first move's probability
		// isn't fixed if the game could theoretically start mid-way with a different probability.
		// However, the problem implies a standard start at 75%.
		// If _calculateWinProbRecursive is called with a probability not reachable from 75% via steps of 10,
		// those states won't be pre-populated unless explicitly called.
		// For a standard game, only 75% is needed as the entry point.
		// The recursive calls will explore all reachable probabilities (75, 65, 55, 45, 35, 25).
		this._calculateWinProbRecursive(0, 0, 0, 0, 0, 0, this.probMax); // Standard start

		// To be absolutely exhaustive for any possible starting probability (though not strictly needed by prompt):
		// for (let p = this.probMin; p <= this.probMax; p += this.probStep) {
		//   this._calculateWinProbRecursive(0, 0, 0, 0, 0, 0, p);
		// }
	}

	/**
	 * Determines the optimal row to play in the current game state.
	 * @param gameState The current state of the game.
	 * @returns An OptimalMoveResult containing the expected win probabilities for each row.
	 */
	public getOptimalMove(gameState: StoneState): OptimalMoveResult {
		const linesStatus = [gameState.line1, gameState.line2, gameState.line3];
		const c = [0, 0, 0]; // cells filled per row
		const s = [0, 0, 0]; // successes per row

		for (let i = 0; i < 3; i++) {
			for (const cell of linesStatus[i]) {
				if (cell.detectedStatus !== "pending") {
					c[i]++;
					if (cell.detectedStatus === "success") {
						s[i]++;
					}
				}
			}
		}

		const [current_c1, current_c2, current_c3] = c;
		const [current_s1, current_s2, current_s3] = s;
		const currentProb = gameState.percentage;

		if (current_c1 + current_c2 + current_c3 === this.totalTurns) {
			// Game is over, calculate final win status
			return { rowDecisionProbabilities: undefined };
		}

		const rowProbs: [number, number, number] = [-1, -1, -1]; // Initialize with -1 (not possible/calculated)

		// Pre-calculate probability values for reuse
		const probOfSuccess =
			this.probabilityMap.get(currentProb) ?? currentProb / 100.0;
		const probOfFailure = 1.0 - probOfSuccess;
		const nextProbAfterSuccess = Math.max(
			this.probMin,
			currentProb - this.probStep
		);
		const nextProbAfterFailure = Math.min(
			this.probMax,
			currentProb + this.probStep
		);

		const currentCells = [current_c1, current_c2, current_c3];
		const currentSuccesses = [current_s1, current_s2, current_s3];

		for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
			if (currentCells[rowIdx] < this.maxCellsPerRow) {
				// Calculate state after success in this row
				const successState = [...currentCells];
				const successSuccesses = [...currentSuccesses];
				successState[rowIdx]++;
				successSuccesses[rowIdx]++;

				const successKey = this._stateToKey(
					successState[0],
					successSuccesses[0],
					successState[1],
					successSuccesses[1],
					successState[2],
					successSuccesses[2],
					nextProbAfterSuccess
				);

				// Ensure the recursive calculation was run for this next state's probability during _populateMemo
				if (!this.memo.has(successKey)) {
					this._calculateWinProbRecursive(
						successState[0],
						successSuccesses[0],
						successState[1],
						successSuccesses[1],
						successState[2],
						successSuccesses[2],
						nextProbAfterSuccess
					);
				}
				const winProbIfSuccess = this.memo.get(successKey) ?? 0.0;

				// Calculate state after failure in this row
				const failureState = [...currentCells];
				const failureSuccesses = [...currentSuccesses];
				failureState[rowIdx]++;

				const failureKey = this._stateToKey(
					failureState[0],
					failureSuccesses[0],
					failureState[1],
					failureSuccesses[1],
					failureState[2],
					failureSuccesses[2],
					nextProbAfterFailure
				);

				if (!this.memo.has(failureKey)) {
					this._calculateWinProbRecursive(
						failureState[0],
						failureSuccesses[0],
						failureState[1],
						failureSuccesses[1],
						failureState[2],
						failureSuccesses[2],
						nextProbAfterFailure
					);
				}
				const winProbIfFailure = this.memo.get(failureKey) ?? 0.0;

				const currentMoveExpectedWinProb =
					probOfSuccess * winProbIfSuccess + probOfFailure * winProbIfFailure;
				rowProbs[rowIdx] = currentMoveExpectedWinProb;
			}
			// rowProbs[rowIdx] remains -1 as initialized, indicating not playable
		}

		return {
			rowDecisionProbabilities: rowProbs,
		};
	}

	/**
	 * Get the best row to play based on the calculated probabilities
	 * @param rowDecisionProbabilities The probabilities for each row
	 * @returns The best row (1, 2, or 3) or null if no move is possible
	 */
	public getBestRow(
		rowDecisionProbabilities: [number, number, number] | undefined
	): number | null {
		if (!rowDecisionProbabilities) return null;

		let bestRow = null;
		let bestProb = -1;

		for (let i = 0; i < 3; i++) {
			if (rowDecisionProbabilities[i] > bestProb) {
				bestProb = rowDecisionProbabilities[i];
				bestRow = i + 1; // Convert to 1-based indexing
			}
		}

		return bestRow;
	}
}
