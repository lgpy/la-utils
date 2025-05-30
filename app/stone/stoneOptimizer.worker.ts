import { type GameState, StoneGameOptimizer } from "@/lib/stone";

let optimizer: StoneGameOptimizer | null = null;

self.onmessage = (event: MessageEvent) => {
	const { type, payload } = event.data;

	try {
		if (type === "init") {
			optimizer = new StoneGameOptimizer(
				payload.goalConditions,
				payload.maxRedundantRedFails,
			);
			self.postMessage({ type: "initDone" });
		} else if (type === "getOptimalMove") {
			if (!optimizer) {
				self.postMessage({
					type: "error",
					message: "Optimizer not initialized",
				});
				return;
			}
			const result = optimizer.getOptimalMove(payload.gameState as GameState);
			self.postMessage({ type: "optimalMove", data: result });
		}
	} catch (error) {
		self.postMessage({
			type: "error",
			message: (error as Error).message,
			stack: (error as Error).stack,
		});
	}
};
