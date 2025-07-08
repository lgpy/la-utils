import type { Character } from "@/providers/MainStoreProvider";
import { getLatestBiWeeklyReset, getLatestWeeklyReset } from "./dates";
import { isGateCompleted, raids } from "./raids";
import { Class, Difficulty } from "@/generated/prisma";

type RaidGoldInfo = Record<string, GoldInfo>;

type GoldInfo = {
	thisWeek: {
		earnedGold: {
			bound: number;
			unbound: number;
		};
		totalGold: {
			bound: number;
			unbound: number;
		};
	};
	nextWeek: {
		earnableGold: {
			bound: number;
			unbound: number;
		};
	};
}

export function parseGoldInfo(charRaids: Character["assignedRaids"]) {
	const ret = {} as RaidGoldInfo;

	const lastWeeklyReset = getLatestWeeklyReset();
	for (const [assignedRaidId, assignedRaid] of Object.entries(charRaids)) {
		const raidInfo = raids[assignedRaidId];
		if (!raidInfo) continue;

		for (const [assignedGateId, assignedGate] of Object.entries(assignedRaid)) {
			const actualGate = raidInfo.gates[assignedGateId];
			const gateGoldReward =
				actualGate.difficulties[assignedGate.difficulty]?.rewards.gold || {
					bound: 0,
					unbound: 0,
				}

			if (ret[assignedRaidId] === undefined) {
				ret[assignedRaidId] = {
					thisWeek: {
						earnedGold: {
							bound: 0,
							unbound: 0
						},
						totalGold: {
							bound: 0,
							unbound: 0
						},
					},
					nextWeek: {
						earnableGold: {
							bound: 0,
							unbound: 0
						},
					},
				};
			}

			ret[assignedRaidId].thisWeek.totalGold.bound += gateGoldReward.bound;
			ret[assignedRaidId].thisWeek.totalGold.unbound += gateGoldReward.unbound;

			if (
				assignedGate.completed &&
				actualGate.isBiWeekly !== undefined &&
				assignedGate.completedDate !== undefined
			) {
				//check if was completed this reset
				if (new Date(assignedGate.completedDate) > lastWeeklyReset) {
					ret[assignedRaidId].thisWeek.earnedGold.bound += gateGoldReward.bound;
					ret[assignedRaidId].thisWeek.earnedGold.unbound += gateGoldReward.unbound;
				} else {
					ret[assignedRaidId].thisWeek.totalGold.bound -= gateGoldReward.bound;
					ret[assignedRaidId].thisWeek.totalGold.unbound -= gateGoldReward.unbound;
				}
			} else if (assignedGate.completed) {
				ret[assignedRaidId].thisWeek.earnedGold.bound += gateGoldReward.bound;
				ret[assignedRaidId].thisWeek.earnedGold.unbound += gateGoldReward.unbound;
			}

			const now = new Date();
			now.setDate(now.getDate() + 7);
			const plus1week = now;

			if (
				actualGate.isBiWeekly === undefined ||
				assignedGate.completedDate === undefined
			) {
				//ignore weekly reset
				ret[assignedRaidId].nextWeek.earnableGold.bound += gateGoldReward.bound;
				ret[assignedRaidId].nextWeek.earnableGold.unbound += gateGoldReward.unbound;
			} else {
				const isGateComplete = isGateCompleted(
					new Date(assignedGate.completedDate),
					getLatestBiWeeklyReset(actualGate.isBiWeekly, plus1week),
				);
				if (!isGateComplete) {
					ret[assignedRaidId].nextWeek.earnableGold.bound += gateGoldReward.bound;
					ret[assignedRaidId].nextWeek.earnableGold.unbound += gateGoldReward.unbound;
				}
			}
		}
	}
	return ret;
}

export function getHighest3(
	charRaids: Character["assignedRaids"],
	raidGoldInfo: RaidGoldInfo,
	ignoreThaemineIfNoG4: boolean,
) {
	const sortedGoldThisWeek = Object.entries(raidGoldInfo).sort(
		([aId, a], [bId, b]) => {
			if (
				ignoreThaemineIfNoG4 &&
				charRaids.thaemine?.G4?.completedDate !== undefined &&
				(aId === "thaemine" || bId === "thaemine")
			) {
				const lastReset = getLatestWeeklyReset();
				if (
					charRaids.thaemine.G4.completed &&
					new Date(charRaids.thaemine.G4.completedDate) < lastReset
				)
					return aId === "thaemine" ? 1 : -1;
			}

			if (a.thisWeek.totalGold === b.thisWeek.totalGold) {
				const aActualIndex = Object.keys(raids).indexOf(aId);
				const bActualIndex = Object.keys(raids).indexOf(bId);
				return bActualIndex - aActualIndex;
			}
			return b.thisWeek.totalGold.bound + b.thisWeek.totalGold.unbound - a.thisWeek.totalGold.bound - a.thisWeek.totalGold.unbound;
		},
	);

	const sortedGoldNextWeek = Object.entries(raidGoldInfo).sort(
		([aId, a], [bId, b]) => {
			if (a.nextWeek.earnableGold === b.nextWeek.earnableGold) {
				const aActualIndex = Object.keys(raids).indexOf(aId);
				const bActualIndex = Object.keys(raids).indexOf(bId);
				return bActualIndex - aActualIndex;
			}
			return b.nextWeek.earnableGold.bound + b.nextWeek.earnableGold.unbound - a.nextWeek.earnableGold.bound - a.nextWeek.earnableGold.unbound;
		},
	);

	return {
		thisWeek: sortedGoldThisWeek.slice(0, 3).reduce(
			(acc, [raidId, info]) => Object.assign(acc, { [raidId]: info.thisWeek }),
			{} as Record<
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
			>,
		),
		nextWeek: sortedGoldNextWeek
			.slice(0, 3)
			.reduce(
				(acc, [raidId, info]) =>
					Object.assign(acc, { [raidId]: info.nextWeek.earnableGold }),
				{} as Record<string, {
					bound: number;
					unbound: number;
				}>,
			),
	};
}

export function sortRaidKeys(a: string, b: string) {
	const keys = Object.keys(raids);
	return keys.indexOf(b) - keys.indexOf(a);
}

const difficultyOrder: Record<Difficulty, number> = {
	[Difficulty.Hard]: 0,
	[Difficulty.Normal]: 1,
	[Difficulty.Solo]: 2,
};

export function sortDifficulties(
	a: Difficulty,
	b: Difficulty,
) {
	return (difficultyOrder[a] ?? 99) - (difficultyOrder[b] ?? 99);
}

export function separateSupportAndDps<T extends { class: Class }>(objWithClass: T[]) {
	const ret = {
		support: [] as T[],
		dps: [] as T[],
	};

	for (const cls of objWithClass) {
		switch (cls.class) {
			// Support classes
			case Class.Bard:
			case Class.Paladin:
			case Class.Artist:
				ret.support.push(cls);
				break;
			// DPS classes
			case Class.Berserker:
			case Class.Destroyer:
			case Class.Gunlancer:
			case Class.Slayer:
			case Class.Arcanist:
			case Class.Sorceress:
			case Class.Summoner:
			case Class.Glaivier:
			case Class.Scrapper:
			case Class.Soulfist:
			case Class.Wardancer:
			case Class.Striker:
			case Class.Breaker:
			case Class.Artillerist:
			case Class.Deadeye:
			case Class.Gunslinger:
			case Class.Machinist:
			case Class.Sharpshooter:
			case Class.Deathblade:
			case Class.Reaper:
			case Class.Shadowhunter:
			case Class.Souleater:
			case Class.Aeromancer:
			case Class.Wildsoul:
				ret.dps.push(cls);
				break;
			default: {
				const _exhaustiveCheck: never = cls.class;
				break;
			}
		}
	}
	return ret;
}
