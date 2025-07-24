import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatGold } from "@/lib/format";
import { raids } from "@/lib/raids";
import { cn } from "@/lib/utils";
import type { Character } from "@/stores/main-store/provider";
import PiggyBankProgressBar from "./PiggyBankProgressBar";

type Props = {
	className?: string;
	char: Character;
	highest3ThisWeek: Record<
		string,
		{
			earnedGold: {
				bound: number;
				unbound: number;
			};
			totalGold: {
				bound: number;
				unbound: number;
			};
		}
	>;
	highest3NextWeek: Record<string, {
		bound: number;
		unbound: number;
	}>;
};

export default function PiggyBank(props: Props) {
	const { highest3ThisWeek, highest3NextWeek, className, char } = props;

	const thisWeek = Object.values(highest3ThisWeek).reduce(
		(acc, thisWeek) => {
			acc.earned += thisWeek.earnedGold.bound + thisWeek.earnedGold.unbound;
			acc.total += thisWeek.totalGold.bound + thisWeek.totalGold.unbound;
			return acc;
		},
		{ earned: 0, total: 0 },
	);

	const nextWeek = Object.values(highest3NextWeek).reduce(
		(acc, earnable) => acc + earnable.bound + earnable.unbound,
		0,
	);

	const hasBiweekly = Object.entries(char.assignedRaids).some(
		([raidId, gates]) =>
			Object.keys(gates).some(
				(gateId) => raids[raidId].gates[gateId].isBiWeekly,
			),
	);

	// Calculate progress, handling division by zero
	const progressPercentage =
		thisWeek.total > 0 ? (thisWeek.earned / thisWeek.total) * 100 : 0;

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<PiggyBankProgressBar
						progress={progressPercentage}
						className={cn("size-5 m-0! absolute top-2 right-2", className)}
					/>
				</TooltipTrigger>
				<TooltipContent>
					<div className="grid grid-cols-[auto_auto] gap-1">
						<span className="font-extralight">This Week:</span>
						<span>
							{formatGold(thisWeek.earned)}/{formatGold(thisWeek.total)}
						</span>
						{hasBiweekly && (
							<>
								<span className="font-extralight">Next Week:</span>
								<span>{formatGold(nextWeek)}</span>
							</>
						)}
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
