"use client";

import { getHighest3, parseGoldInfo } from "@/lib/chars";
import { raids } from "@/lib/raids";
import { useMainStore, useSettingsStore } from "@/providers/MainStoreProvider";
import { useMemo } from "react";
import AnimatedNumber from "./AnimatedNumber";
import { formatGold } from "@/lib/format";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "@/components/ui/table";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { Info } from "lucide-react";

export default function RosterGold() {
	const mainStore = useMainStore();
	const settingsStore = useSettingsStore();

	const rosterGold = useMemo(() => {
		if (!mainStore.hasHydrated || !settingsStore.hasHydrated) {
			return;
		}
		const ret = mainStore.characters.reduce(
			(acc, char) => {
				if (!char.isGoldEarner) return acc;
				const goldInfo = parseGoldInfo(char.assignedRaids);
				const highest3 = getHighest3(
					char.assignedRaids,
					goldInfo,
					settingsStore.experiments.ignoreThaemineIfNoG4,
				);
				for (const thisWeek of Object.values(highest3.thisWeek)) {
					acc.thisWeek.earnedGold.bound += thisWeek.earnedGold.bound;
					acc.thisWeek.earnedGold.unbound += thisWeek.earnedGold.unbound;
					acc.thisWeek.totalGold.bound += thisWeek.totalGold.bound;
					acc.thisWeek.totalGold.unbound += thisWeek.totalGold.unbound;
				}
				for (const earnable of Object.values(highest3.nextWeek)) {
					acc.nextWeek.earnableGold.bound += earnable.bound;
					acc.nextWeek.earnableGold.unbound += earnable.unbound;
				}
				return acc;
			},
			{
				thisWeek: {
					earnedGold: {
						bound: 0,
						unbound: 0,
					}, totalGold: {
						bound: 0,
						unbound: 0,
					}
				},
				nextWeek: {
					earnableGold: {
						bound: 0,
						unbound: 0,
					}
				},
			},
		);
		return ret;
	}, [
		mainStore.characters,
		mainStore.hasHydrated,
		settingsStore.hasHydrated,
		settingsStore.experiments.ignoreThaemineIfNoG4,
	]);

	const hasBiweekly = mainStore.characters.some((char) =>
		Object.entries(char.assignedRaids).some(([raidId, gates]) =>
			Object.keys(gates).some(
				(gateId) => raids[raidId].gates[gateId].isBiWeekly,
			),
		),
	);

	if (!mainStore.hasHydrated || !settingsStore.hasHydrated) {
		return null;
	}

	if (!rosterGold) {
		return null;
	}

	return (

		<Popover>
			<PopoverTrigger asChild>
				<div className="grid grid-cols-[auto_auto] gap-x-2 fixed left-4 bottom-4 text-ctp-yellow/60 select-none cursor-pointer">
					<div className="col-span-2 flex items-center gap-2">
						<h2 className="text-xl font-bold">Roster Gold</h2>
						<Info className="size-4" />
					</div>
					<p className="font-extralight">This Week:</p>
					{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
					<p
						className="cursor-pointer"
					>
						<AnimatedNumber n={rosterGold.thisWeek.earnedGold.bound + rosterGold.thisWeek.earnedGold.unbound} format="gold" />
						/
						<AnimatedNumber n={rosterGold.thisWeek.totalGold.bound + rosterGold.thisWeek.totalGold.unbound} format="gold" />
					</p>
					{hasBiweekly && (
						<>
							<p className="font-extralight">Next Week:</p>

							<p>
								<AnimatedNumber
									n={rosterGold.nextWeek.earnableGold.bound + rosterGold.nextWeek.earnableGold.unbound}
									format="gold"
								/>
							</p>
						</>
					)}
				</div>
			</PopoverTrigger>
			<PopoverContent collisionPadding={10} className="w-fit">
				<div className="space-y-4 p-2">
					<h3 className="font-bold text-lg mb-2 text-center">Roster Gold Breakdown</h3>
					<div className="font-semibold text-secondary-foreground mb-2">This Week</div>
					<div className="bg-muted/20 rounded-md border border-border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-1/4">Type</TableHead>
									<TableHead className="w-1/4 text-center">Bound</TableHead>
									<TableHead className="w-1/4 text-center">Unbound</TableHead>
									<TableHead className="w-1/4 text-center">Both</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody className="text-center text-ctp-yellow">
								<TableRow>
									<TableCell className="text-muted-foreground text-left">Earned</TableCell>
									<TableCell>{formatGold(rosterGold.thisWeek.earnedGold.bound)}</TableCell>
									<TableCell>{formatGold(rosterGold.thisWeek.earnedGold.unbound)}</TableCell>
									<TableCell>{formatGold(rosterGold.thisWeek.earnedGold.bound + rosterGold.thisWeek.earnedGold.unbound)}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell className="text-muted-foreground text-left">Remaining</TableCell>
									<TableCell>{formatGold(rosterGold.thisWeek.totalGold.bound - rosterGold.thisWeek.earnedGold.bound)}</TableCell>
									<TableCell>{formatGold(rosterGold.thisWeek.totalGold.unbound - rosterGold.thisWeek.earnedGold.unbound)}</TableCell>
									<TableCell>{formatGold((rosterGold.thisWeek.totalGold.bound + rosterGold.thisWeek.totalGold.unbound) - (rosterGold.thisWeek.earnedGold.bound + rosterGold.thisWeek.earnedGold.unbound))}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell className="text-muted-foreground text-left">Total</TableCell>
									<TableCell>{formatGold(rosterGold.thisWeek.totalGold.bound)}</TableCell>
									<TableCell>{formatGold(rosterGold.thisWeek.totalGold.unbound)}</TableCell>
									<TableCell>{formatGold(rosterGold.thisWeek.totalGold.bound + rosterGold.thisWeek.totalGold.unbound)}</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</div>
					{hasBiweekly && (
						<>
							<div className="font-semibold text-secondary-foreground mb-2">Next Week</div>
							<div className="bg-muted/20 rounded-md border border-border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-1/4">Type</TableHead>
											<TableHead className="w-1/4 text-center">Bound</TableHead>
											<TableHead className="w-1/4 text-center">Unbound</TableHead>
											<TableHead className="w-1/4 text-center">Both</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody className="text-center text-ctp-yellow">
										<TableRow>
											<TableCell className="text-muted-foreground text-left">Earnable</TableCell>
											<TableCell>{formatGold(rosterGold.nextWeek.earnableGold.bound)}</TableCell>
											<TableCell>{formatGold(rosterGold.nextWeek.earnableGold.unbound)}</TableCell>
											<TableCell>{formatGold(rosterGold.nextWeek.earnableGold.bound + rosterGold.nextWeek.earnableGold.unbound)}</TableCell>
										</TableRow>
									</TableBody>
								</Table>
							</div>
						</>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
