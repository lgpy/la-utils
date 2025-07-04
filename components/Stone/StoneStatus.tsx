"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	type GoalCondition,
	type StoneState,
	getColorClasses,
} from "@/lib/stone";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useStoneOptimizer } from "./StoneStatus.hooks";

interface StoneStatusProps {
	stoneState: StoneState | undefined;
	className?: string;
}

const goals: Record<string, GoalCondition[]> = {
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

export default function StoneStatus({
	stoneState,
	className,
}: StoneStatusProps) {
	const {
		changeGoal,
		optimalMove,
		isCalculating,
		isWorkerReady: optimizerReady,
		selectedGoal,
	} = useStoneOptimizer(stoneState);

	return (
		<Card className={cn(className)}>
			<CardHeader>
				<CardTitle>Stone state</CardTitle>
			</CardHeader>
			<CardContent>
				{stoneState === undefined ? (
					<div className="text-gray-500">No stone state available</div>
				) : (
					<>
						<div className="flex justify-between items-end mb-4 ">
							<Select value={selectedGoal} onValueChange={changeGoal}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Select Stone Goal" />
								</SelectTrigger>
								<SelectContent>
									{Object.keys(goals).map((key) => (
										<SelectItem key={key} value={key}>
											{key} or better
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<div>
								{selectedGoal && !optimizerReady && (
									<span className="text-sm text-gray-400 mr-2">
										Loading model...
									</span>
								)}
								{optimizerReady && isCalculating && (
									<span className="text-sm text-gray-400 mr-2">
										Calculating...
									</span>
								)}
							</div>
							<div>
								Success rate{" "}
								<span className="text-yellow">{stoneState?.percentage}%</span>
							</div>
						</div>
						<div className="grid grid-cols-[repeat(10,40px)_65px] items-center justify-center text-center gap-2">
							<AnimatePresence mode="popLayout">
								{stoneState?.line1.map((cell) => (
									<motion.div
										key={`l1-${cell.pos}-${cell.detectedStatus}`}
										className={cn(
											"size-6 transform rotate-45 border-2 border-neutral-700 shadow-md",
											getColorClasses(cell.detectedStatus, true).background,
										)}
										initial={{
											scale: 0.3,
											opacity: 0,
										}}
										animate={{
											scale: 1,
											opacity: 1,
										}}
										exit={{
											scale: 0.3,
											opacity: 0,
										}}
										transition={{
											duration: 0.6,
											type: "spring",
											stiffness: 200,
											damping: 15,
										}}
									/>
								))}
							</AnimatePresence>
							<div className="flex justify-center items-center h-8">
								{optimalMove?.rowDecisionProbabilities?.[0] !== undefined && (
									<motion.span
										className={cn("text-sm font-medium", {
											"text-red-400":
												Math.max(...optimalMove.rowDecisionProbabilities) ===
												optimalMove.rowDecisionProbabilities[0] &&
												optimalMove.rowDecisionProbabilities[0] > 0,
											"text-gray-400":
												optimalMove.rowDecisionProbabilities[0] === -1,
											"text-gray-300":
												optimalMove.rowDecisionProbabilities[0] !== -1 &&
												Math.max(...optimalMove.rowDecisionProbabilities) !==
												optimalMove.rowDecisionProbabilities[0],
										})}
										animate={{
											color:
												Math.max(...optimalMove.rowDecisionProbabilities) ===
													optimalMove.rowDecisionProbabilities[0] &&
													optimalMove.rowDecisionProbabilities[0] > 0
													? "rgb(248 113 113)" // red-400
													: optimalMove.rowDecisionProbabilities[0] === -1
														? "rgb(156 163 175)" // gray-400
														: "rgb(209 213 219)", // gray-300
										}}
										transition={{
											duration: 0.2,
											ease: "easeOut",
										}}
									>
										{optimalMove.rowDecisionProbabilities[0] === -1
											? "0%"
											: `${Number(
												(
													optimalMove.rowDecisionProbabilities[0] * 100
												).toFixed(2),
											)}%`}
									</motion.span>
								)}
							</div>
							<AnimatePresence mode="popLayout">
								{stoneState?.line2.map((cell) => (
									<motion.div
										key={`l2-${cell.pos}-${cell.detectedStatus}`}
										className={cn(
											"size-6 transform rotate-45 border-2 border-neutral-700 shadow-md",
											getColorClasses(cell.detectedStatus, true).background,
										)}
										initial={{
											scale: 0.3,
											opacity: 0,
										}}
										animate={{
											scale: 1,
											opacity: 1,
										}}
										exit={{
											scale: 0.3,
											opacity: 0,
										}}
										transition={{
											duration: 0.6,
											type: "spring",
											stiffness: 200,
											damping: 15,
										}}
									/>
								))}
							</AnimatePresence>
							<div className="flex justify-center items-center h-8">
								{optimalMove?.rowDecisionProbabilities?.[1] !== undefined && (
									<motion.span
										className={cn("text-sm font-medium", {
											"text-red-400":
												Math.max(...optimalMove.rowDecisionProbabilities) ===
												optimalMove.rowDecisionProbabilities[1] &&
												optimalMove.rowDecisionProbabilities[1] > 0,
											"text-gray-400":
												optimalMove.rowDecisionProbabilities[1] === -1,
											"text-gray-300":
												optimalMove.rowDecisionProbabilities[1] !== -1 &&
												Math.max(...optimalMove.rowDecisionProbabilities) !==
												optimalMove.rowDecisionProbabilities[1],
										})}
										animate={{
											color:
												Math.max(...optimalMove.rowDecisionProbabilities) ===
													optimalMove.rowDecisionProbabilities[1] &&
													optimalMove.rowDecisionProbabilities[1] > 0
													? "rgb(248 113 113)" // red-400
													: optimalMove.rowDecisionProbabilities[1] === -1
														? "rgb(156 163 175)" // gray-400
														: "rgb(209 213 219)", // gray-300
										}}
										transition={{
											duration: 0.2,
											ease: "easeOut",
										}}
									>
										{optimalMove.rowDecisionProbabilities[1] === -1
											? "0%"
											: `${Number(
												(
													optimalMove.rowDecisionProbabilities[1] * 100
												).toFixed(2),
											)}%`}
									</motion.span>
								)}
							</div>
							<AnimatePresence mode="popLayout">
								{stoneState?.line3.map((cell) => (
									<motion.div
										key={`l3-${cell.pos}-${cell.detectedStatus}`}
										className={cn(
											"size-6 transform rotate-45 border-2 border-neutral-700 shadow-md",
											getColorClasses(cell.detectedStatus, false).background,
										)}
										initial={{
											scale: 0.3,
											opacity: 0,
										}}
										animate={{
											scale: 1,
											opacity: 1,
										}}
										exit={{
											scale: 0.3,
											opacity: 0,
										}}
										transition={{
											duration: 0.6,
											type: "spring",
											stiffness: 200,
											damping: 15,
										}}
									/>
								))}
							</AnimatePresence>{" "}
							<div className="flex justify-center items-center h-8">
								{optimalMove?.rowDecisionProbabilities?.[2] !== undefined && (
									<motion.span
										className={cn("text-sm font-medium", {
											"text-red-400":
												Math.max(...optimalMove.rowDecisionProbabilities) ===
												optimalMove.rowDecisionProbabilities[2] &&
												optimalMove.rowDecisionProbabilities[2] > 0,
											"text-gray-400":
												optimalMove.rowDecisionProbabilities[2] === -1,
											"text-gray-300":
												optimalMove.rowDecisionProbabilities[2] !== -1 &&
												Math.max(...optimalMove.rowDecisionProbabilities) !==
												optimalMove.rowDecisionProbabilities[2],
										})}
										animate={{
											color:
												Math.max(...optimalMove.rowDecisionProbabilities) ===
													optimalMove.rowDecisionProbabilities[2] &&
													optimalMove.rowDecisionProbabilities[2] > 0
													? "rgb(248 113 113)" // red-400
													: optimalMove.rowDecisionProbabilities[2] === -1
														? "rgb(156 163 175)" // gray-400
														: "rgb(209 213 219)", // gray-300
										}}
										transition={{
											duration: 0.2,
											ease: "easeOut",
										}}
									>
										{optimalMove.rowDecisionProbabilities[2] === -1
											? "0%"
											: `${Number(
												(
													optimalMove.rowDecisionProbabilities[2] * 100
												).toFixed(2),
											)}%`}
									</motion.span>
								)}
							</div>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
