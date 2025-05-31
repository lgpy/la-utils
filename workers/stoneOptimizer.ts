import {
	type GoalCondition,
	StoneGameOptimizer,
	type StoneState,
	type StoneStateInterface,
} from "@/lib/stone";

let optimizer: StoneGameOptimizer | null = null;

type BaseMessage<T, Y> = {
	type: T;
	payload: Y;
};

type InitMessage = BaseMessage<
	"init",
	{ goalConditions: GoalCondition[]; maxRedundantRedFails: number }
>;

type GetOptimalMoveMessage = BaseMessage<
	"calculate",
	{ gameState: StoneState }
>;

type MessageType = InitMessage | GetOptimalMoveMessage;

addEventListener("message", (event: MessageEvent<MessageType>) => {
	const { type, payload } = event.data;
	console.debug("Worker received message:", type, payload);

	try {
		if (type === "init") {
			optimizer = new StoneGameOptimizer(
				payload.goalConditions,
				payload.maxRedundantRedFails,
			);
			postMessage({ type: "initDone" });
		} else if (type === "calculate") {
			if (!optimizer) {
				postMessage({
					type: "error",
					message: "Optimizer not initialized",
				});
				return;
			}

			const result = optimizer.getOptimalMove(payload.gameState);
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
