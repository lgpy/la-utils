"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { PixelTarget } from "./types";
import { getColorClasses } from "./utils";

interface TargetOverviewCardProps {
	targets: PixelTarget[];
	className?: string;
}

export default function TargetOverviewCard({
	targets,
	className,
}: TargetOverviewCardProps) {
	if (targets.length === 0) {
		console.log("TargetOverviewCard: No targets to display."); // Added console.log for empty targets
		return null;
	}

	return (
		<Card className={cn(className)}>
			<CardHeader>
				<CardTitle>Target Status Overview ({targets.length})</CardTitle>
			</CardHeader>
			<CardContent>
				<TooltipProvider delayDuration={100}>
					<div className="flex flex-col items-center">
						{[1, 2, 3].map((lineIndex: number) => {
							const lineTargets = targets.filter(
								(target: PixelTarget) => target.line === lineIndex,
							);
							if (lineTargets.length === 0) return null; // Don't render a line if no targets
							return (
								<div
									key={lineIndex}
									className={`flex justify-center my-${lineIndex === 1 ? 2 : 0}`}
								>
									{lineTargets.map((target: PixelTarget) => (
										<Tooltip key={target.name}>
											<TooltipTrigger asChild>
												<div
													className={cn(
														"w-6 h-6 transform rotate-45 m-1.5 border-2 border-neutral-700 shadow-md",
														getColorClasses(
															target.detectedStatus,
															target.line !== 3,
														).background,
													)}
													aria-label={`Target ${target.name}`}
												/>
											</TooltipTrigger>
											<TooltipContent className="text-xs">
												<p className="font-semibold">{target.name}</p>
												<hr className="my-1" />
												<p>
													Cfg: ({target.x},{target.y})
												</p>
												<p>
													Status:{" "}
													<span
														className={cn(
															"font-medium",
															target.detectedStatus === "success" &&
																"text-green-500",
															target.detectedStatus === "failure" &&
																"text-red-500",
															target.detectedStatus === "pending" &&
																"text-yellow-500",
														)}
													>
														{target.detectedStatus?.toUpperCase() || "N/A"}
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
