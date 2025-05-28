"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Cell } from "./types";
import { getColorClasses } from "./utils";

interface CellOverviewCardProps {
	cells: Cell[];
	className?: string;
}

export default function CellOverviewCard({
	cells,
	className,
}: CellOverviewCardProps) {
	if (cells.length === 0) {
		console.log("CellOverviewCard: No cells to display."); // Added console.log for empty cells
		return null;
	}

	return (
		<Card className={cn(className)}>
			<CardHeader>
				<CardTitle>Cell Status Overview ({cells.length})</CardTitle>
			</CardHeader>
			<CardContent>
				<TooltipProvider delayDuration={100}>
					<div className="flex flex-col items-center">
						{[1, 2, 3].map((lineIndex: number) => {
							const lineCells = cells.filter((cell) => cell.line === lineIndex);
							if (lineCells.length === 0) return null; // Don't render a line if no cells
							return (
								<div
									key={lineIndex}
									className={`flex justify-center my-${lineIndex === 1 ? 2 : 0}`}
								>
									{lineCells.map((cell) => (
										<Tooltip key={cell.line + cell.pos}>
											<TooltipTrigger asChild>
												<div
													className={cn(
														"w-6 h-6 transform rotate-45 m-1.5 border-2 border-neutral-700 shadow-md",
														getColorClasses(
															cell.detectedStatus,
															cell.line !== 3,
														).background,
													)}
													aria-label={`Cell line ${cell.line}, pos ${cell.pos}`}
												/>
											</TooltipTrigger>
											<TooltipContent className="text-xs">
												<p className="font-semibold">
													L {cell.line}, P{cell.pos}
												</p>
												<hr className="my-1" />
												<p>
													Cfg: ({cell.x},{cell.y})
												</p>
												<p>
													Status:{" "}
													<span
														className={cn(
															"font-medium",
															cell.detectedStatus === "success" &&
																"text-green-500",
															cell.detectedStatus === "failure" &&
																"text-red-500",
															cell.detectedStatus === "pending" &&
																"text-yellow-500",
														)}
													>
														{cell.detectedStatus?.toUpperCase() || "N/A"}
													</span>
												</p>
											</TooltipContent>
										</Tooltip>
									))}
								</div>
							);
						})}
					</div>
				</TooltipProvider>
			</CardContent>
		</Card>
	);
}
