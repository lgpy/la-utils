import { getGateResetDate, getLatestWeeklyReset } from "@/lib/dates";
import { isGateCompleted } from "@/lib/raids";
import { StateActions } from "../main-store";
import { Difficulty } from "@/generated/prisma";
import { getIndexOrThrow, getOrThrow } from "@/lib/array";
import { raidData } from "@/lib/game-info";

export type RaidActions = {
	//assigned raids mutations
	charAddRaid: (
		charId: string,
		raidId: string,
		gates: Record<string, Difficulty>,
	) => void;
	charEditRaid: (
		charId: string,
		raidId: string,
		gates: Record<string, Difficulty>,
	) => void;
	charDelRaid: (charId: string, raidId: string) => void;

	//assigned raids completion
	raidAction: (action: {
		type: "complete" | "uncomplete";
		charId: string;
		raidId: string;
		mode?: "all" | "last";
	}) => void;
	toggleGate: (charId: string, raidId: string, gateId: string) => void;
	untoggleGate: (charId: string, raidId: string, gateId: string) => void;
	toggleAllGates: (charId: string, raidId: string) => void;
	untoggleAllGates: (charId: string, raidId: string) => void;
	toggleSingleGate: (charId: string, raidId: string, gateId: string) => void;
	untoggleSingleGate: (charId: string, raidId: string, gateId: string) => void;
	setGates: (data: Array<{ charId: string, raidId: string, gateId: string, completedDate: Date }>) => {
		updatedSomething: boolean;
		errors: string[];
	};
};

export const createRaidActions: StateActions<RaidActions> = (set) => ({
	charAddRaid(charId, raidId, gates) {
		set((state) => {
			const char = getOrThrow(state.characters, (c) => c.id === charId, "Character not found");

			const newAssignedRaid: typeof char.assignedRaids[typeof raidId] = {};

			for (const [gateId, Diff] of Object.entries(gates)) {
				newAssignedRaid[gateId] = {
					difficulty: Diff,
					completedDate: undefined,
				};
			}

			char.assignedRaids[raidId] = newAssignedRaid;
		});
	},
	charEditRaid(charId, raidId, gates) {
		set((state) => {
			const char = getOrThrow(state.characters, (c) => c.id === charId, "Character not found");

			const updatedAssignedRaid: typeof char.assignedRaids[typeof raidId] = {};

			for (const [gateId, Diff] of Object.entries(gates)) {
				updatedAssignedRaid[gateId] = {
					difficulty: Diff,
					completedDate: char.assignedRaids[raidId]?.[gateId]?.completedDate,
				};
			}

			char.assignedRaids[raidId] = updatedAssignedRaid;
		});
	},
	charDelRaid(charId, raidId) {
		set((state) => {
			const char = getOrThrow(state.characters, (c) => c.id === charId, "Character not found");

			delete char.assignedRaids[raidId];
		});
	},

	raidAction({
		type,
		charId,
		raidId,
		mode,
	}) {
		set((state) => {
			const char = getOrThrow(state.characters, (c) => c.id === charId, "Character not found");

			let newCompletedDate: string | undefined;
			switch (type) {
				case "complete":
					newCompletedDate = new Date().toISOString();
					break;
				case "uncomplete":
					newCompletedDate = undefined;
					break;
				default:
					const _: never = type;
			}

			if (mode === "all") {
				for (const gateId of Object.keys(char.assignedRaids[raidId])) {
					char.assignedRaids[raidId][gateId].completedDate = newCompletedDate;
				}
			} else if (mode === "last" && type === "uncomplete") {
				const lastCompletedGate = Object.entries(
					char.assignedRaids[raidId],
				).findLast(([gId, g]) => {
					if (g.completedDate === undefined) return false;
					return isGateCompleted(
						new Date(g.completedDate),
						getGateResetDate(raidId, gId),
					);
				});
				if (!lastCompletedGate) throw new Error("No gates to uncomplete");
				char.assignedRaids[raidId][lastCompletedGate[0]].completedDate =
					newCompletedDate;
			} else if (mode === "last" && type === "complete") {
				const firstIncompleteGate = Object.entries(
					char.assignedRaids[raidId],
				).find(([gId, g]) => {
					if (g.completedDate === undefined) return true;
					return !isGateCompleted(
						new Date(g.completedDate),
						getGateResetDate(raidId, gId),
					);
				});
				if (!firstIncompleteGate) throw new Error("No gates to complete");
				char.assignedRaids[raidId][firstIncompleteGate[0]].completedDate =
					newCompletedDate;
			}
		});
	},
	toggleGate: (charId, raidId, gateId) => {
		set((state) => {
			const charIndex = getIndexOrThrow(state.characters, (c) => c.id === charId, "Character not found");

			const assignedRaid =
				state.characters[charIndex].assignedRaids[raidId];
			if (assignedRaid === undefined) throw new Error("Raid not found");

			const gate = assignedRaid[gateId];
			if (gate === undefined) throw new Error("Gate not found");

			const isCompleted =
				gate.completedDate !== undefined
					? isGateCompleted(
						new Date(gate.completedDate),
						getGateResetDate(raidId, gateId),
					)
					: false;

			const gateData = raidData.getOrThrow(raidId).getGateOrThrow(gateId);

			if (isCompleted && !gateData.isBiWeekly) {
				const gateIndex = Object.keys(assignedRaid).findIndex(
					(g) => g === gateId,
				);
				Object.keys(assignedRaid).forEach((gateId, index) => {
					if (index <= gateIndex) return;
					const actualGate = raidData.getOrThrow(raidId).getGateOrThrow(gateId);
					if (actualGate.isBiWeekly) {
						const lastreset = getLatestWeeklyReset();
						const biweeklyGateIsCompleted =
							assignedRaid[gateId].completedDate !== undefined
								? isGateCompleted(
									new Date(assignedRaid[gateId].completedDate),
									getGateResetDate(raidId, gateId),
								)
								: false;
						if (
							biweeklyGateIsCompleted &&
							assignedRaid[gateId].completedDate &&
							new Date(assignedRaid[gateId].completedDate) < lastreset
						) {
							return;
						}
					}
					assignedRaid[gateId].completedDate = undefined;
				});
			} else {
				const gateKeys = Object.keys(assignedRaid);
				const gateIndex = gateKeys.findIndex((gate) => gate === gateId);
				for (let i = 0; i <= gateIndex; i++) {
					const gateData = raidData.getOrThrow(raidId).getGateOrThrow(gateKeys[i]);
					if (gateData.isBiWeekly) {
						const completedDate = assignedRaid[gateKeys[i]].completedDate;
						const biweeklyGateIsCompleted =
							completedDate !== undefined
								? isGateCompleted(
									new Date(completedDate),
									getGateResetDate(raidId, gateId),
								)
								: false;
						if (biweeklyGateIsCompleted) {
							continue;
						}
					}
					assignedRaid[gateKeys[i]].completedDate =
						new Date().toISOString();
				}
			}
		});
	},
	untoggleGate: (charId, raidId, gateId) => {
		set((state) => {
			const charIndex = getIndexOrThrow(state.characters, (c) => c.id === charId, "Character not found");

			const assignedRaid =
				state.characters[charIndex].assignedRaids[raidId];
			if (assignedRaid === undefined) throw new Error("Raid not found");
			const gate = assignedRaid[gateId];
			if (gate === undefined) throw new Error("Gate not found");

			const gateKeys = Object.keys(assignedRaid);
			const gateIndex = gateKeys.findIndex((gate) => gate === gateId);
			for (let i = gateIndex; i < gateKeys.length; i++) {
				const gateKey = gateKeys[i];
				const aGate = assignedRaid[gateKey];
				const gateData = raidData.getOrThrow(raidId).getGateOrThrow(gateKey);
				if (
					gateData.isBiWeekly &&
					gateKey !== gateId
				) {
					const lastreset = getLatestWeeklyReset();
					if (aGate.completedDate !== undefined) {
						const biWeeklyDate = new Date(aGate.completedDate);
						const biweeklyGateIsCompleted = isGateCompleted(
							biWeeklyDate,
							getGateResetDate(raidId, gateKey),
						);
						if (biweeklyGateIsCompleted && biWeeklyDate < lastreset) {
							continue;
						}
					}
				}
				aGate.completedDate = undefined;
			}
		});
	},
	toggleAllGates: (charId, raidId) => {
		set((state) => {
			const charIndex = getIndexOrThrow(state.characters, (c) => c.id === charId, "Character not found");

			const assignedRaid =
				state.characters[charIndex].assignedRaids[raidId];
			if (assignedRaid === undefined) throw new Error("Raid not found");

			const gateKeys = Object.keys(assignedRaid);
			for (let i = 0; i < gateKeys.length; i++) {
				const gateKey = gateKeys[i];
				const aGate = assignedRaid[gateKey];
				const gateData = raidData.getOrThrow(raidId).getGateOrThrow(gateKey);
				if (gateData.isBiWeekly) {
					const lastreset = getLatestWeeklyReset();
					if (aGate.completedDate !== undefined) {
						const biWeeklyDate = new Date(aGate.completedDate);
						const biweeklyGateIsCompleted = isGateCompleted(
							biWeeklyDate,
							getGateResetDate(raidId, gateKey),
						);
						if (biweeklyGateIsCompleted && biWeeklyDate < lastreset) {
							continue;
						}
					}
				}
				aGate.completedDate = new Date().toISOString();
			}
		});
	},
	untoggleAllGates: (charId, raidId) => {
		set((state) => {
			const charIndex = getIndexOrThrow(state.characters, (c) => c.id === charId, "Character not found");
			const assignedRaid =
				state.characters[charIndex].assignedRaids[raidId];
			if (assignedRaid === undefined) throw new Error("Raid not found");

			const gateKeys = Object.keys(assignedRaid);
			for (let i = 0; i < gateKeys.length; i++) {
				const gateKey = gateKeys[i];
				const aGate = assignedRaid[gateKey];
				const gateData = raidData.getOrThrow(raidId).getGateOrThrow(gateKey);
				if (gateData.isBiWeekly) {
					const lastreset = getLatestWeeklyReset();
					if (aGate.completedDate !== undefined) {
						const biWeeklyDate = new Date(aGate.completedDate);
						const biweeklyGateIsCompleted = isGateCompleted(
							biWeeklyDate,
							getGateResetDate(raidId, gateKey),
						);
						if (biweeklyGateIsCompleted && biWeeklyDate < lastreset) {
							continue;
						}
					}
				}
				aGate.completedDate = undefined;
			}
		});
	},
	toggleSingleGate: (charId, raidId, gateId) => {
		set((state) => {
			const charIndex = getIndexOrThrow(state.characters, (c) => c.id === charId, "Character not found");

			const assignedRaid =
				state.characters[charIndex].assignedRaids[raidId];
			if (assignedRaid === undefined) throw new Error("Raid not found");
			const gate = assignedRaid[gateId];
			if (gate === undefined) throw new Error("Gate not found");

			gate.completedDate = new Date().toISOString();
		});
	},
	untoggleSingleGate: (charId, raidId, gateId) => {
		set((state) => {
			const charIndex = getIndexOrThrow(state.characters, (c) => c.id === charId, "Character not found");

			const assignedRaid =
				state.characters[charIndex].assignedRaids[raidId];
			if (assignedRaid === undefined) throw new Error("Raid not found");
			const gate = assignedRaid[gateId];
			if (gate === undefined) throw new Error("Gate not found");

			gate.completedDate = undefined;
		});
	},
	setGates(data) {
		let updatedSomething = false;
		const errors = new Set<string>();

		set((state) => {
			for (const { charId, raidId, gateId, completedDate } of data) {
				const charIndex = state.characters.findIndex((c) => c.id === charId);
				if (charIndex === -1) {
					errors.add(`Character not found: ${charId}`);
					continue;
				}

				const assignedRaid =
					state.characters[charIndex].assignedRaids[raidId];
				if (assignedRaid === undefined) {
					const charName = state.characters[charIndex].name;
					errors.add(`Raid ${raidId} not assigned for character ${charName}`);
					continue;
				}

				const gate = assignedRaid[gateId];
				if (gate === undefined) {
					const charName = state.characters[charIndex].name;
					errors.add(`Gate ${gateId} not found for raid ${raidId} on character ${charName}`);
					continue;
				}

				const isCompleted =
					gate.completedDate !== undefined
						? isGateCompleted(
							new Date(gate.completedDate),
							getGateResetDate(raidId, gateId),
						)
						: false;

				if (!isCompleted) {
					gate.completedDate = completedDate.toISOString();
					updatedSomething = true;
				}
			}
		});

		return {
			updatedSomething,
			errors: Array.from(errors)
		};
	},
})
