"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Cell, getColorClasses } from "@/lib/stone";
import { cn } from "@/lib/utils";

interface CellOverviewCardProps {
	cells: Cell[];
	className?: string;
}

export default function CellOverviewCard({
	cells,
	className,
}: CellOverviewCardProps) {
	if (cells.length === 0) {
		return null;
	}

	return (
		<Card className={cn(className)}>
			<CardHeader>
				<CardTitle>Cell Status Overview ({cells.length})</CardTitle>
			</CardHeader>
			<CardContent>
				<TooltipProvider delayDuration={100}>
					<div className="flex flex-col gap-2 items-center">
						{[1, 2, 3].map((lineIndex: number) => {
							const lineCells = cells.filter((cell) => cell.line === lineIndex);
							if (lineCells.length === 0) return null; // Don't render a line if no cells
							return (
								<div
									key={lineIndex}
									className={`flex justify-center  gap-2 my-${lineIndex === 1 ? 2 : 0}`}
								>
									{lineCells.map((cell) => (
										<Tooltip key={cell.line + cell.pos} delayDuration={0}>
											<TooltipTrigger asChild>
												<div
													className={cn(
														"w-6 h-6 transform rotate-45 m-1.5 border-2 border-neutral-700 shadow-md",
														getColorClasses(
															cell.detectedStatus,
															cell.line !== 3
														).background
													)}
													aria-label={`Cell line ${cell.line}, pos ${cell.pos}`}
												/>
											</TooltipTrigger>
											<TooltipContent className="text-xs">
												<p className="font-semibold">
													Line {cell.line}, Position {cell.pos}
												</p>
												<hr className="my-1" />
												<p>
													Coords: ({cell.x},{cell.y})
												</p>
												<p>
													RGB Value: ({cell.rgb[0]}, {cell.rgb[1]},{cell.rgb[2]}
													)
												</p>
												<p>
													HSL Value: ({cell.hsl[0].toFixed(2)},
													{cell.hsl[1].toFixed(2)},{cell.hsl[2].toFixed(2)})
												</p>
												<p>
													Status:{" "}
													<span
														className={cn(
															"font-medium",
															cell.detectedStatus === "success" &&
																"text-ctp-green",
															cell.detectedStatus === "failure" &&
																"text-ctp-red",
															cell.detectedStatus === "pending" &&
																"text-ctp-yellow",
															cell.detectedStatus === "unknown" &&
																"text-gray-500"
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
