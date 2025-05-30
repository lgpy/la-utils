import { type GameState, StoneGameOptimizer } from "@/lib/stone";

let optimizer: StoneGameOptimizer | null = null;

addEventListener("message", (event: MessageEvent) => {
	const { type, payload } = event.data;

	try {
		if (type === "init") {
			optimizer = new StoneGameOptimizer(
				payload.goalConditions,
				payload.maxRedundantRedFails,
			);
			postMessage({ type: "initDone" });
		} else if (type === "getOptimalMove") {
			if (!optimizer) {
				postMessage({
					type: "error",
					message: "Optimizer not initialized",
				});
				return;
			}
			const result = optimizer.getOptimalMove(payload.gameState as GameState);
			postMessage({ type: "optimalMove", data: result });
		}
	} catch (error) {
		postMessage({
			type: "error",
			message: (error as Error).message,
			stack: (error as Error).stack,
		});
	}
});
