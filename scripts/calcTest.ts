import { StoneState, StoneGameOptimizer } from "@/lib/stone/";
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { cpus } from 'os';

type idk = 'pending' | 'success' | 'failure';

class StoneGame {
  r1: Array<idk>;
  r2: Array<idk>;
  r3: Array<idk>;
  percentage: number;

  constructor() {
    this.r1 = Array.from({ length: 10 }, () => 'pending');
    this.r2 = Array.from({ length: 10 }, () => 'pending');
    this.r3 = Array.from({ length: 10 }, () => 'pending');
    this.percentage = 75;
  }

  private getLine(line: number): Array<idk> {
    switch (line) {
      case 1:
        return this.r1;
      case 2:
        return this.r2;
      case 3:
        return this.r3;
      default:
        throw new Error("Invalid line number");
    }
  }

  facet(line: number) {
    let row = this.getLine(line);
    const succeeded = Math.random() * 100 < this.percentage;
    const firstPendingIndex = row.findIndex(
      (status) => status === 'pending'
    );
    if (firstPendingIndex === -1) {
      throw new Error("No pending cells to facet");
    }
    row[firstPendingIndex] = succeeded ? 'success' : 'failure';
    if (succeeded) {
      this.percentage = Math.max(this.percentage - 10, 25);
    } else {
      this.percentage = Math.min(this.percentage + 10, 75);
    }
  }

  get successes() {
    return {
      r1: this.r1.filter(status => status === 'success').length,
      r2: this.r2.filter(status => status === 'success').length,
      r3: this.r3.filter(status => status === 'success').length,
    }
  }

  get isSuccess() {
    for (const goal of Goals) {
      if (
        this.successes.r1 >= goal.r1MinSuccess &&
        this.successes.r2 >= goal.r2MinSuccess &&
        this.successes.r3 < 5
      ) {
        return true;
      }
    }
    return false;
  }
}

const Iterations = 10000000;
const Goals =
  [
    { r1MinSuccess: 9, r2MinSuccess: 7 },
    { r1MinSuccess: 10, r2MinSuccess: 6 },
    { r1MinSuccess: 7, r2MinSuccess: 9 },
    { r1MinSuccess: 8, r2MinSuccess: 10 },
  ];

interface WorkerResult {
  successCount: number;
  iterations: number;
}

function runSimulation(iterations: number): WorkerResult {
  const optimizer = new StoneGameOptimizer(Goals);
  let successCount = 0;

  for (let i = 0; i < iterations; i++) {
    const game = new StoneGame();
    while (true) {
      const move = optimizer.getOptimalMove(new StoneState({
        line1: game.r1.map((status, idx) => ({ detectedStatus: status, pos: idx })),
        line2: game.r2.map((status, idx) => ({ detectedStatus: status, pos: idx })),
        line3: game.r3.map((status, idx) => ({ detectedStatus: status, pos: idx })),
        percentage: game.percentage,
      }));
      const lineToFacet = optimizer.getBestRow(move.rowDecisionProbabilities);
      if (lineToFacet === null)
        break;
      game.facet(lineToFacet);
      if (game.isSuccess) {
        successCount++;
      }
    }
  }

  return { successCount, iterations };
}

// Worker thread code
if (!isMainThread) {
  const { iterations } = workerData;
  const result = runSimulation(iterations);
  parentPort?.postMessage(result);
} else {
  // Main thread code
  async function main() {
    const numThreads = cpus().length;
    const iterationsPerThread = Math.floor(Iterations / numThreads);
    const remainingIterations = Iterations % numThreads;

    console.log(`Using ${numThreads} threads for ${Iterations} iterations`);
    console.log(`Each thread will run ${iterationsPerThread} iterations`);
    if (remainingIterations > 0) {
      console.log(`Main thread will run additional ${remainingIterations} iterations`);
    }

    const workers: Worker[] = [];
    const workerPromises: Promise<WorkerResult>[] = [];

    console.time('Total execution time');
    // Create workers
    for (let i = 0; i < numThreads; i++) {
      const worker = new Worker(__filename, {
        workerData: { iterations: iterationsPerThread }
      });
      workers.push(worker);

      workerPromises.push(new Promise((resolve, reject) => {
        worker.on('message', resolve);
        worker.on('error', reject);
      }));
    }

    // Run remaining iterations on main thread if any
    let mainThreadResult: WorkerResult = { successCount: 0, iterations: 0 };
    if (remainingIterations > 0) {
      mainThreadResult = runSimulation(remainingIterations);
    }

    try {
      // Wait for all workers to complete
      const results = await Promise.all(workerPromises);

      // Terminate workers
      workers.forEach(worker => worker.terminate());

      // Aggregate results
      const totalSuccessCount = results.reduce((sum, result) => sum + result.successCount, 0) + mainThreadResult.successCount;
      const totalIterations = results.reduce((sum, result) => sum + result.iterations, 0) + mainThreadResult.iterations;

      console.timeEnd('Total execution time');
      console.log(`Total games succeeded: ${totalSuccessCount} out of ${totalIterations}`);
      console.log(`Success rate: ${(totalSuccessCount / totalIterations) * 100}%`);
    } catch (error) {
      console.error('Error in worker threads:', error);
      workers.forEach(worker => worker.terminate());
    }
  }

  main();
}
