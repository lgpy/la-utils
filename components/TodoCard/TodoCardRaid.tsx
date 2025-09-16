import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { shortenDifficulty, shortestDifficulty } from "@/lib/raids";
import { cn } from "@/lib/utils";
import type { Character } from "@/stores/main-store/provider";
import { HandCoins } from "lucide-react";
import TodoCardCompleteButton from "./TodoCardCompleteButton";
import { raidData } from "@/lib/game-info";

interface Props {
	charId: string;
	raidId: string;
	raid: Character["assignedRaids"][string];
	goldEarner: boolean;
}

export default function TodoCardRaid({
	charId,
	raidId,
	raid,
	goldEarner,
}: Props) {
	const actualraid = raidData.get(raidId);

	if (!actualraid) {
		console.error(`Raid ${raidId} not found`);
		return null;
	}

	const completedlen = Object.values(raid).reduce(
		(acc, ag) => (ag.completed ? acc + 1 : acc),
		0
	);

	return (
		<div
			className={cn(
				"flex flex-row justify-between items-center gap-2 p-3 transition",
				{
					"bg-primary/10": completedlen === Object.keys(raid).length,
				}
			)}
		>
			<div className="flex flex-col grow min-w-0 items-start gap-1.5">
				<p className="">{actualraid.name}</p>
				<div className="flex flex-row gap-1">
					{goldEarner && <HandCoins className="size-4 stroke-ctp-yellow" />}
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
											([gid, g]) => `${gid} ${shortenDifficulty(g.difficulty)}`
										)
										.join(", ")}
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>
			<TodoCardCompleteButton
				assignedGates={raid}
				charId={charId}
				raidId={raidId}
			/>
		</div>
	);
}
