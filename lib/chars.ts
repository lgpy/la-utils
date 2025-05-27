import type { Character } from "@/providers/MainStoreProvider";
import { getLatestBiWeeklyReset, getLatestWeeklyReset } from "./dates";
import { isGateCompleted, raids } from "./raids";

export function parseGoldInfo(charRaids: Character["assignedRaids"]) {
	const ret = {} as Record<
		string,
		{
			thisWeek: {
				earnedGold: number;
				totalGold: number;
			};
			nextWeek: {
				earnableGold: number;
			};
		}
	>;

	const lastWeeklyReset = getLatestWeeklyReset();
	Object.entries(charRaids).forEach(([assignedRaidId, assignedRaid]) => {
		const raid = raids[assignedRaidId];
		if (!raid) return;

		Object.entries(assignedRaid).forEach(([assignedGateId, assignedGate]) => {
			const actualGate = raid.gates[assignedGateId];
			const gateGoldReward =
				actualGate.difficulties[assignedGate.difficulty]?.rewards.gold || 0;

			if (ret[assignedRaidId] === undefined) {
				ret[assignedRaidId] = {
					thisWeek: {
						earnedGold: 0,
						totalGold: 0,
					},
					nextWeek: {
						earnableGold: 0,
					},
				};
			}

			ret[assignedRaidId].thisWeek.totalGold += gateGoldReward;

			if (
				assignedGate.completed &&
				actualGate.isBiWeekly !== undefined &&
				assignedGate.completedDate !== undefined
			) {
				//check if was completed this reset
				if (new Date(assignedGate.completedDate) > lastWeeklyReset) {
					ret[assignedRaidId].thisWeek.earnedGold += gateGoldReward;
				} else {
					ret[assignedRaidId].thisWeek.totalGold -= gateGoldReward;
				}
			} else if (assignedGate.completed) {
				ret[assignedRaidId].thisWeek.earnedGold += gateGoldReward;
			}

			const now = new Date();
			now.setDate(now.getDate() + 7);
			const plus1week = now;

			if (
				actualGate.isBiWeekly === undefined ||
				assignedGate.completedDate === undefined
			) {
				//ignore weekly reset
				ret[assignedRaidId].nextWeek.earnableGold += gateGoldReward;
			} else {
				const isGateComplete = isGateCompleted(
					new Date(assignedGate.completedDate),
					getLatestBiWeeklyReset(actualGate.isBiWeekly, plus1week),
				);
				if (!isGateComplete)
					ret[assignedRaidId].nextWeek.earnableGold += gateGoldReward;
			}
		});
	});
	return ret;
}

export function getHighest3(
	charRaids: Character["assignedRaids"],
	goldInfo: Record<
		string,
		{
			thisWeek: {
				earnedGold: number;
				totalGold: number;
			};
			nextWeek: {
				earnableGold: number;
			};
		}
	>,
	ignoreThaemineIfNoG4: boolean,
) {
	const sortedGoldThisWeek = Object.entries(goldInfo).sort(
		([aId, a], [bId, b]) => {
			if (
				ignoreThaemineIfNoG4 &&
				charRaids["thaemine"]?.["G4"]?.completedDate !== undefined &&
				(aId === "thaemine" || bId === "thaemine")
			) {
				const lastReset = getLatestWeeklyReset();
				if (
					charRaids["thaemine"]["G4"].completed &&
					new Date(charRaids["thaemine"]["G4"].completedDate) < lastReset
				)
					return aId === "thaemine" ? 1 : -1;
			}

			if (a.thisWeek.totalGold === b.thisWeek.totalGold) {
				const aActualIndex = Object.keys(raids).indexOf(aId);
				const bActualIndex = Object.keys(raids).indexOf(bId);
				return bActualIndex - aActualIndex;
			}
			return b.thisWeek.totalGold - a.thisWeek.totalGold;
		},
	);

	const sortedGoldNextWeek = Object.entries(goldInfo).sort(
		([aId, a], [bId, b]) => {
			if (a.nextWeek.earnableGold === b.nextWeek.earnableGold) {
				const aActualIndex = Object.keys(raids).indexOf(aId);
				const bActualIndex = Object.keys(raids).indexOf(bId);
				return bActualIndex - aActualIndex;
			}
			return b.nextWeek.earnableGold - a.nextWeek.earnableGold;
		},
	);

	return {
		thisWeek: sortedGoldThisWeek.slice(0, 3).reduce(
			(acc, [raidId, info]) => Object.assign(acc, { [raidId]: info.thisWeek }),
			{} as Record<
				string,
				{
					earnedGold: number;
					totalGold: number;
				}
			>,
		),
		nextWeek: sortedGoldNextWeek
			.slice(0, 3)
			.reduce(
				(acc, [raidId, info]) =>
					Object.assign(acc, { [raidId]: info.nextWeek.earnableGold }),
				{} as Record<string, number>,
			),
	};
}

export function sortRaidKeys(a: string, b: string) {
	const keys = Object.keys(raids);
	return keys.indexOf(a) - keys.indexOf(b);
}
