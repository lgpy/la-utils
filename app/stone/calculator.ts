// filepath: c:\\Users\\lgpy\\repos\\la-utilsv2\\app\\test\\calculator.ts

/**
 * Represents the state of a cell in a row.
 */
export type CellState = 'success' | 'failure' | 'pending';

/**
 * Defines the input structure for the current game state.
 */
export interface GameState {
  line1: CellState[];
  line2: CellState[];
  line3: CellState[];
  percentage: number; // Current success probability (e.g., 75, 65, ..., 25)
}

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
  private memo: Map<string, number>;
  private readonly goals: GoalCondition[];
  private readonly r3MaxSuccessExclusive: number;

  private readonly maxCellsPerRow: number = 10;
  private readonly totalTurns: number = 30;
  private readonly probMin: number = 25;
  private readonly probMax: number = 75;
  private readonly probStep: number = 10;

  /**
   * Initializes the StoneGameOptimizer.
   * @param goals An array of goal conditions for Rows 1 and 2.
   * @param r3MaxSuccessExclusive The maximum number of successes allowed in Row 3 (exclusive) for a win. Defaults to 5.
   */
  constructor(goals: GoalCondition[], r3MaxSuccessExclusive: number = 5) {
    this.goals = goals;
    this.r3MaxSuccessExclusive = r3MaxSuccessExclusive;
    this.memo = new Map<string, number>();
    this._populateMemo();
  }

  private _stateToString(c1: number, s1: number, c2: number, s2: number, c3: number, s3: number, prob: number): string {
    return `${c1}-${s1}-${c2}-${s2}-${c3}-${s3}-${prob}`;
  }

  private _checkVictory(s1: number, s2: number, s3: number): boolean {
    for (const goal of this.goals) {
      if (s1 >= goal.r1MinSuccess && s2 >= goal.r2MinSuccess && s3 < this.r3MaxSuccessExclusive) {
        return true;
      }
    }
    return false;
  }

  private _calculateWinProbRecursive(
    c1: number, s1: number, // Cells filled and successes for row 1
    c2: number, s2: number, // Cells filled and successes for row 2
    c3: number, s3: number, // Cells filled and successes for row 3
    currentProb: number
  ): number {
    // Base Case: Game End (all 30 cells filled)
    if (c1 + c2 + c3 === this.totalTurns) {
      return this._checkVictory(s1, s2, s3) ? 1.0 : 0.0;
    }

    // Invalid states (should not be reached with correct logic but good for safety)
    if (s1 > c1 || s2 > c2 || s3 > c3 || c1 > this.maxCellsPerRow || c2 > this.maxCellsPerRow || c3 > this.maxCellsPerRow) {
      return 0.0; // Or throw an error
    }


    const stateStr = this._stateToString(c1, s1, c2, s2, c3, s3, currentProb);
    if (this.memo.has(stateStr)) {
      return this.memo.get(stateStr)!;
    }

    let maxOverallWinProbIfPlayerPlaysOptimally = 0.0;

    // Option 1: Try placing in Row 1
    if (c1 < this.maxCellsPerRow) {
      const probOfSuccess = currentProb / 100.0;
      const probOfFailure = 1.0 - probOfSuccess;

      const nextProbAfterSuccess = Math.max(this.probMin, currentProb - this.probStep);
      const winProbIfSuccess = this._calculateWinProbRecursive(c1 + 1, s1 + 1, c2, s2, c3, s3, nextProbAfterSuccess);

      const nextProbAfterFailure = Math.min(this.probMax, currentProb + this.probStep);
      const winProbIfFailure = this._calculateWinProbRecursive(c1 + 1, s1, c2, s2, c3, s3, nextProbAfterFailure);

      const expectedWinProbForChoosingRow1 = (probOfSuccess * winProbIfSuccess) + (probOfFailure * winProbIfFailure);
      if (expectedWinProbForChoosingRow1 > maxOverallWinProbIfPlayerPlaysOptimally) {
        maxOverallWinProbIfPlayerPlaysOptimally = expectedWinProbForChoosingRow1;
      }
    }

    // Option 2: Try placing in Row 2
    if (c2 < this.maxCellsPerRow) {
      const probOfSuccess = currentProb / 100.0;
      const probOfFailure = 1.0 - probOfSuccess;

      const nextProbAfterSuccess = Math.max(this.probMin, currentProb - this.probStep);
      const winProbIfSuccess = this._calculateWinProbRecursive(c1, s1, c2 + 1, s2 + 1, c3, s3, nextProbAfterSuccess);

      const nextProbAfterFailure = Math.min(this.probMax, currentProb + this.probStep);
      const winProbIfFailure = this._calculateWinProbRecursive(c1, s1, c2 + 1, s2, c3, s3, nextProbAfterFailure);

      const expectedWinProbForChoosingRow2 = (probOfSuccess * winProbIfSuccess) + (probOfFailure * winProbIfFailure);
      if (expectedWinProbForChoosingRow2 > maxOverallWinProbIfPlayerPlaysOptimally) {
        maxOverallWinProbIfPlayerPlaysOptimally = expectedWinProbForChoosingRow2;
      }
    }

    // Option 3: Try placing in Row 3
    if (c3 < this.maxCellsPerRow) {
      const probOfSuccess = currentProb / 100.0;
      const probOfFailure = 1.0 - probOfSuccess;

      const nextProbAfterSuccess = Math.max(this.probMin, currentProb - this.probStep);
      const winProbIfSuccess = this._calculateWinProbRecursive(c1, s1, c2, s2, c3 + 1, s3 + 1, nextProbAfterSuccess);

      const nextProbAfterFailure = Math.min(this.probMax, currentProb + this.probStep);
      const winProbIfFailure = this._calculateWinProbRecursive(c1, s1, c2, s2, c3 + 1, s3, nextProbAfterFailure);

      const expectedWinProbForChoosingRow3 = (probOfSuccess * winProbIfSuccess) + (probOfFailure * winProbIfFailure);
      if (expectedWinProbForChoosingRow3 > maxOverallWinProbIfPlayerPlaysOptimally) {
        maxOverallWinProbIfPlayerPlaysOptimally = expectedWinProbForChoosingRow3;
      }
    }

    this.memo.set(stateStr, maxOverallWinProbIfPlayerPlaysOptimally);
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
   * @returns An object containing the best row to play (1, 2, or 3) and the expected win probability if that move is made.
   *          Returns null for bestRow if the game is over.
   */
  public getOptimalMove(gameState: GameState): OptimalMoveResult {
    const linesStatus = [gameState.line1, gameState.line2, gameState.line3];
    const c = [0, 0, 0]; // cells filled per row
    const s = [0, 0, 0]; // successes per row

    for (let i = 0; i < 3; i++) {
      for (const status of linesStatus[i]) {
        if (status !== 'pending') {
          c[i]++;
          if (status === 'success') {
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

    for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
      let canPlayInThisRow = false;
      if (rowIdx === 0 && current_c1 < this.maxCellsPerRow) canPlayInThisRow = true;
      else if (rowIdx === 1 && current_c2 < this.maxCellsPerRow) canPlayInThisRow = true;
      else if (rowIdx === 2 && current_c3 < this.maxCellsPerRow) canPlayInThisRow = true;

      if (canPlayInThisRow) {
        const probOfSuccess = currentProb / 100.0;
        const probOfFailure = 1.0 - probOfSuccess;

        // Calculate state after success in this row
        const nextProbAfterSuccess = Math.max(this.probMin, currentProb - this.probStep);
        let s_c1 = current_c1, s_s1 = current_s1, s_c2 = current_c2, s_s2 = current_s2, s_c3 = current_c3, s_s3 = current_s3;
        if (rowIdx === 0) { s_c1++; s_s1++; }
        else if (rowIdx === 1) { s_c2++; s_s2++; }
        else { s_c3++; s_s3++; }

        // Ensure the recursive calculation was run for this next state's probability during _populateMemo
        // If not, it means this state wasn't reachable from the initial _populateMemo call (e.g. if currentProb was not standard)
        // For safety, we can call _calculateWinProbRecursive here if not found, but it should be pre-populated.
        if (!this.memo.has(this._stateToString(s_c1, s_s1, s_c2, s_s2, s_c3, s_s3, nextProbAfterSuccess))) {
          this._calculateWinProbRecursive(s_c1, s_s1, s_c2, s_s2, s_c3, s_s3, nextProbAfterSuccess);
        }
        const winProbIfSuccess = this.memo.get(this._stateToString(s_c1, s_s1, s_c2, s_s2, s_c3, s_s3, nextProbAfterSuccess)) ?? 0.0;


        // Calculate state after failure in this row
        const nextProbAfterFailure = Math.min(this.probMax, currentProb + this.probStep);
        let f_c1 = current_c1, f_s1 = current_s1, f_c2 = current_c2, f_s2 = current_s2, f_c3 = current_c3, f_s3 = current_s3;
        if (rowIdx === 0) { f_c1++; } // s1 remains current_s1
        else if (rowIdx === 1) { f_c2++; } // s2 remains current_s2
        else { f_c3++; } // s3 remains current_s3

        if (!this.memo.has(this._stateToString(f_c1, f_s1, f_c2, f_s2, f_c3, f_s3, nextProbAfterFailure))) {
          this._calculateWinProbRecursive(f_c1, f_s1, f_c2, f_s2, f_c3, f_s3, nextProbAfterFailure);
        }
        const winProbIfFailure = this.memo.get(this._stateToString(f_c1, f_s1, f_c2, f_s2, f_c3, f_s3, nextProbAfterFailure)) ?? 0.0;

        const currentMoveExpectedWinProb = (probOfSuccess * winProbIfSuccess) + (probOfFailure * winProbIfFailure);
        rowProbs[rowIdx] = currentMoveExpectedWinProb;
      } else {
        // rowProbs[rowIdx] remains -1 as initialized, indicating not playable
      }
    }
    return {
      rowDecisionProbabilities: rowProbs
    };
  }
}
