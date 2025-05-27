"use client";

import { getHighest3, parseGoldInfo } from "@/lib/chars";
import { raids } from "@/lib/raids";
import { useMainStore, useSettingsStore } from "@/providers/MainStoreProvider";
import { useMemo } from "react";
import AnimatedNumber from "./AnimatedNumber";

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
				Object.values(highest3.thisWeek).forEach((thisWeek) => {
					acc.thisWeek.earnedGold += thisWeek.earnedGold;
					acc.thisWeek.totalGold += thisWeek.totalGold;
				});
				Object.values(highest3.nextWeek).forEach((earnable) => {
					acc.nextWeek.earnableGold += earnable;
				});
				return acc;
			},
			{
				thisWeek: { earnedGold: 0, totalGold: 0 },
				nextWeek: { earnableGold: 0 },
			},
		);
		if (settingsStore.rosterGoldTotal === "remaining") {
			ret.thisWeek.earnedGold = -(
				ret.thisWeek.totalGold - ret.thisWeek.earnedGold
			);
		}
		return ret;
	}, [
		mainStore.characters,
		mainStore.hasHydrated,
		settingsStore.hasHydrated,
		settingsStore.rosterGoldTotal,
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
		<div className="grid grid-cols-[auto_auto] gap-x-2 fixed left-4 bottom-4 text-yellow/60 select-none">
			<h2 className="col-span-2 text-xl font-bold">Roster Gold</h2>
			<p className="font-extralight">This Week:</p>
			<p
				className="cursor-pointer"
				onClick={() =>
					settingsStore.setRosterGoldTotal(
						settingsStore.rosterGoldTotal === "total" ? "remaining" : "total",
					)
				}
			>
				<AnimatedNumber n={rosterGold.thisWeek.earnedGold} format="gold" />
				/
				<AnimatedNumber n={rosterGold.thisWeek.totalGold} format="gold" />
			</p>
			{hasBiweekly && (
				<>
					<p className="font-extralight">Next Week:</p>

					<p>
						<AnimatedNumber
							n={rosterGold.nextWeek.earnableGold}
							format="gold"
						/>
					</p>
				</>
			)}
		</div>
	);
}
