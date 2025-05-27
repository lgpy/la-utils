import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { raids, shortenDifficulty, shortestDifficulty } from "@/lib/raids";
import { cn } from "@/lib/utils";
import {
	type Character,
	useSettingsStore,
} from "@/providers/MainStoreProvider";
import { HandCoins } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

interface Props {
	raidId: string;
	raid: Character["assignedRaids"][string];
	goldEarner: boolean;
	children: ReactNode;
	showBackground?: boolean;
}

export default function TodoCardRaidV2({
	raidId,
	raid,
	goldEarner,
	children,
	showBackground = true,
}: Props) {
	const settingsStore = useSettingsStore();
	const actualraid = raids[raidId];

	if (!actualraid) {
		console.error(`Raid ${raidId} not found`);
		return null;
	}

	if (!settingsStore.hasHydrated) {
		return null;
	}

	const completedRaids = Object.values(raid).reduce(
		(acc, ag) => (ag.completed ? acc + 1 : acc),
		0,
	);

	const progress = completedRaids / Object.keys(raid).length;

	const isCompactCardEnabled = settingsStore.experiments.compactRaidCard;

	return (
		<div
			className={cn(
				"relative flex flex-row items-center justify-between gap-2 p-3 transition",
				{
					"p-1 px-3": isCompactCardEnabled,
				},
			)}
		>
			{showBackground && (
				<motion.div
					className="absolute left-0 right-0 top-0 z-0 h-full bg-primary/10"
					initial={false}
					animate={{
						width: `${progress * 100}%`,
					}}
					transition={{
						duration: 0.4,
					}}
				></motion.div>
			)}

			{goldEarner && (
				<HandCoins
					className={cn(
						"transition-opacity size-4 stroke-yellow absolute right-0.5 bottom-0.5 opacity-80",
						{
							"opacity-40": completedRaids === Object.keys(raid).length,
							"right-px bottom-px": isCompactCardEnabled,
						},
					)}
				/>
			)}
			<div className="z-10 flex flex-col grow min-w-0 items-start gap-1.5">
				<p
					className={cn("transition-all", {
						"opacity-80": completedRaids === Object.keys(raid).length,
					})}
				>
					{actualraid.name}
				</p>
				{!isCompactCardEnabled && (
					<div className="flex flex-row gap-1">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>
									<p className="text-muted-foreground text-xs truncate">
										{Object.values(raid)
											.map((g) => `${shortestDifficulty(g.difficulty)}`)
											.join("")}
									</p>
								</TooltipTrigger>
								<TooltipContent>
									<p>
										{Object.entries(raid)
											.map(
												([gid, g]) =>
													`${gid} ${shortenDifficulty(g.difficulty)}`,
											)
											.join(", ")}
									</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				)}
			</div>
			<div className="z-10 flex flex-row items-center justify-end">
				{children}
			</div>
		</div>
	);
}
