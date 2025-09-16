import {
	type GoalCondition,
	type OptimalMoveResult,
	StoneState,
} from "@/lib/stone";
import { useEffect, useRef, useState } from "react";

export const goals: Record<string, GoalCondition[]> = {
	"77": [
		{ r1MinSuccess: 7, r2MinSuccess: 7 },
		{ r1MinSuccess: 9, r2MinSuccess: 6 },
		{ r1MinSuccess: 6, r2MinSuccess: 9 },
	],
	"96": [
		{ r1MinSuccess: 9, r2MinSuccess: 6 },
		{ r1MinSuccess: 6, r2MinSuccess: 9 },
	],
	"97": [
		{ r1MinSuccess: 9, r2MinSuccess: 7 },
		{ r1MinSuccess: 7, r2MinSuccess: 9 },
		{ r1MinSuccess: 10, r2MinSuccess: 6 },
		{ r1MinSuccess: 6, r2MinSuccess: 10 },
	],
};

export function useStoneOptimizer(stoneState: StoneState | undefined) {
	const workerRef = useRef<Worker | null>(null);
	const [isWorkerReady, setIsWorkerReady] = useState(false);
	const [isCalculating, setIsCalculating] = useState(false);
	const [optimalMove, setOptimalMove] = useState<OptimalMoveResult | null>(
		null
	);
	const [selectedGoal, setSelectedGoal] = useState<string>("");
	const [lastCalculatedState, setLastCalculatedState] = useState<{
		stoneState: StoneState;
		goal: string;
	} | null>(null);

	// Initialize the worker
	useEffect(() => {
		workerRef.current = new Worker(
			new URL("../../workers/stoneOptimizer.ts", import.meta.url)
		);
		console.log("Worker created");

		workerRef.current.onmessage = (event: MessageEvent) => {
			const { type, data, message, stack } = event.data;
			if (type === "initDone") {
				setIsWorkerReady(true);
				console.log("Main: Optimizer ready");
			} else if (type === "optimalMove") {
				setOptimalMove(data);
				setIsCalculating(false);
				console.log("Main: Optimal move received", data);
			} else if (type === "error") {
				console.error("Main: Worker error:", message, stack);
				setIsCalculating(false);
				// Optionally, notify the user of the error
			} else {
				console.log("Main: Received message from worker", type, data);
			}
		};

		workerRef.current.onerror = (error) => {
			console.error("Main: Worker uncaught error:", error);
			setIsCalculating(false);
			// Optionally, notify the user of the error
		};

		// Terminate the worker when the component unmounts
		return () => {
			if (workerRef.current) {
				console.log("Terminating worker");
				workerRef.current.onmessage = null;
				workerRef.current.onerror = null;
				workerRef.current.terminate();
				workerRef.current = null;
			}
		};
	}, []);

	// Initialize the worker with the selected goal
	useEffect(() => {
		setIsWorkerReady(false);
		setOptimalMove(null);
		if (selectedGoal.length === 0) {
			return;
		}
		if (goals[selectedGoal] === undefined) {
			console.warn("Selected goal is not defined");
			return;
		}
		if (workerRef.current === null) {
			console.warn("Worker is not initialized");
			return;
		}

		console.log(
			"Main: Selected goal changed, initializing optimizer in worker",
			selectedGoal
		);
		workerRef.current.postMessage({
			type: "init",
			payload: {
				goalConditions: goals[selectedGoal],
				maxRedundantRedFails: 5,
			},
		});
	}, [selectedGoal]);

	// Handle stone state changes
	useEffect(() => {
		if (
			stoneState === undefined ||
			!isWorkerReady ||
			workerRef.current === null
		) {
			return;
		}

		if (
			lastCalculatedState?.stoneState.isEqual(stoneState) &&
			lastCalculatedState.goal === selectedGoal
		) {
			console.debug("Stone state has not changed, skipping calculation.");
			return;
		}

		setIsCalculating(true);
		setLastCalculatedState({
			stoneState: new StoneState(stoneState),
			goal: selectedGoal,
		});

		console.log("Main: Sending stone state to worker for optimization");
		workerRef.current.postMessage({
			type: "calculate",
			payload: {
				gameState: stoneState,
			},
		});
	}, [stoneState, isWorkerReady, lastCalculatedState, selectedGoal]);

	return {
		selectedGoal,
		changeGoal: setSelectedGoal,
		isWorkerReady,
		isCalculating,
		optimalMove,
	};
}
