import {
	getGateResetDate,
	getLatestWeeklyReset,
	getTaskResetDate,
} from "@/lib/dates";
import { isGateCompleted, raids } from "@/lib/raids";
import { isTaskCompleted } from "@/lib/tasks";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import {
	CreateCharacter,
	deleteCharacter,
	updateCharacter,
} from "./charActions";
import {
	charAddRaid,
	charDelRaid,
	charEditRaid,
	raidAction,
} from "./raidActions";
import { Class, Difficulty } from "@/generated/prisma";

export const zodTask = z.object({
	id: z.string(),
	name: z.string(),
	type: z.enum(["daily", "weekly"]), //! IF YOU ADD A NEW TASK TYPE, FIX THE CODE TO HANDLE IT
	completedDate: z.string().optional(),
});

export const zodChar = z.object({
	id: z.string(),
	name: z.string(),
	class: z.nativeEnum(Class),
	itemLevel: z.number(),
	isGoldEarner: z.boolean(),
	assignedRaids: z.record( //raidId
		z.record( //gateId
			z.object({
				difficulty: z.nativeEnum(Difficulty),
				completedDate: z.string().optional(),
			}),
		),
	),
	tasks: z.array(zodTask),
});

const zodChars = z.object({
	characters: z.array(zodChar),
});

export const zodNewChar = zodChar.pick({
	name: true,
	class: true,
	itemLevel: true,
	isGoldEarner: true,
});
export const zodEditChar = zodChar.pick({
	name: true,
	class: true,
	itemLevel: true,
	isGoldEarner: true,
});
export const zodNewTask = zodTask.pick({ name: true, type: true });

export type MainState = z.infer<typeof zodChars>;

export type MainActions = {
	createCharacter: (char: z.infer<typeof zodNewChar>) => void;
	restoreCharacter: (char: z.infer<typeof zodChar>, index: number) => void;
	updateCharacter: (charId: string, char: z.infer<typeof zodEditChar>) => void;
	deleteCharacter: (charId: string) => void;
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
	restoreData: (data: MainState) => void;
	charAddTask: (charId: string, task: z.infer<typeof zodNewTask>) => void;
	charEditTask: (
		charId: string,
		taskId: string,
		task: z.infer<typeof zodNewTask>,
	) => void;
	charDelTask: (charId: string, taskId: string) => void;
	charToggleTask: (charId: string, taskId: string) => void;
	reorderChars: (charIds: string[]) => void;
	setGate: (charId: string, raidId: string, gateId: string, completedDate: Date) => void;
	availableRaids: () => {
		raidId: string;
		difficulty: Difficulty;
	}[];
};

export type MainStore = MainState & MainActions;

export const createMainStore = () =>
	createStore<MainStore>()(
		persist(
			(set, get) => ({
				characters: [],
				updateCharacter: (charId, char) => updateCharacter(set, charId, char),
				createCharacter: (char) => CreateCharacter(set, char),
				deleteCharacter: (charId) => deleteCharacter(set, charId),
				charAddRaid: (charId, raidId, gates) =>
					charAddRaid(set, charId, raidId, gates),
				charEditRaid: (charId, raidId, gates) =>
					charEditRaid(set, charId, raidId, gates),
				charDelRaid: (charId, raidId) => charDelRaid(set, charId, raidId),
				raidAction: (action) => raidAction(set, action),
				toggleGate: (charId, raidId, gateId) => {
					set((state) => {
						const charIndex = state.characters.findIndex(
							(c) => c.id === charId,
						);
						if (charIndex === -1) throw new Error("Character not found");
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

						if (isCompleted && !raids[raidId].gates[gateId].isBiWeekly) {
							const gateIndex = Object.keys(assignedRaid).findIndex(
								(g) => g === gateId,
							);
							Object.keys(assignedRaid).forEach((gateId, index) => {
								if (index <= gateIndex) return;
								const actualGate = raids[raidId].gates[gateId];
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
								if (raids[raidId].gates[gateKeys[i]].isBiWeekly) {
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

						return { ...state };
					});
				},
				untoggleGate: (charId, raidId, gateId) => {
					set((state) => {
						const charIndex = state.characters.findIndex(
							(c) => c.id === charId,
						);
						if (charIndex === -1) throw new Error("Character not found");
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
							if (
								raids[raidId].gates[gateKey].isBiWeekly &&
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

						return { ...state };
					});
				},
				toggleAllGates: (charId, raidId) => {
					set((state) => {
						const charIndex = state.characters.findIndex(
							(c) => c.id === charId,
						);
						if (charIndex === -1) throw new Error("Character not found");
						const assignedRaid =
							state.characters[charIndex].assignedRaids[raidId];
						if (assignedRaid === undefined) throw new Error("Raid not found");

						const gateKeys = Object.keys(assignedRaid);
						for (let i = 0; i < gateKeys.length; i++) {
							const gateKey = gateKeys[i];
							const aGate = assignedRaid[gateKey];
							if (raids[raidId].gates[gateKey].isBiWeekly) {
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

						return { ...state };
					});
				},
				untoggleAllGates: (charId, raidId) => {
					set((state) => {
						const charIndex = state.characters.findIndex(
							(c) => c.id === charId,
						);
						if (charIndex === -1) throw new Error("Character not found");
						const assignedRaid =
							state.characters[charIndex].assignedRaids[raidId];
						if (assignedRaid === undefined) throw new Error("Raid not found");

						const gateKeys = Object.keys(assignedRaid);
						for (let i = 0; i < gateKeys.length; i++) {
							const gateKey = gateKeys[i];
							const aGate = assignedRaid[gateKey];
							if (raids[raidId].gates[gateKey].isBiWeekly) {
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

						return { ...state };
					});
				},
				toggleSingleGate: (charId, raidId, gateId) => {
					set((state) => {
						const charIndex = state.characters.findIndex(
							(c) => c.id === charId,
						);
						if (charIndex === -1) throw new Error("Character not found");
						const assignedRaid =
							state.characters[charIndex].assignedRaids[raidId];
						if (assignedRaid === undefined) throw new Error("Raid not found");
						const gate = assignedRaid[gateId];
						if (gate === undefined) throw new Error("Gate not found");

						gate.completedDate = new Date().toISOString();

						return { ...state };
					});
				},
				untoggleSingleGate: (charId, raidId, gateId) => {
					set((state) => {
						const charIndex = state.characters.findIndex(
							(c) => c.id === charId,
						);
						if (charIndex === -1) throw new Error("Character not found");
						const assignedRaid =
							state.characters[charIndex].assignedRaids[raidId];
						if (assignedRaid === undefined) throw new Error("Raid not found");
						const gate = assignedRaid[gateId];
						if (gate === undefined) throw new Error("Gate not found");

						gate.completedDate = undefined;

						return { ...state };
					});
				},
				charAddTask(charId, task) {
					set((state) => {
						const char = state.characters.find((c) => c.id === charId);
						if (!char) throw new Error("Character not found");

						const parsedTask = zodNewTask.parse(task);

						char.tasks.push({
							...parsedTask,
							id: uuidv4(),
							completedDate: undefined,
						});

						return { ...state };
					});
				},
				charEditTask(charId, taskId, task) {
					set((state) => {
						const char = state.characters.find((c) => c.id === charId);
						if (!char) throw new Error("Character not found");

						const parsedTask = zodNewTask.parse(task);

						const taskIndex = char.tasks.findIndex((t) => t.id === taskId);
						if (taskIndex === -1) throw new Error("Task not found");

						char.tasks[taskIndex] = {
							...parsedTask,
							id: taskId,
							completedDate: char.tasks[taskIndex].completedDate,
						};

						return { ...state };
					});
				},
				charDelTask(charId, taskId) {
					set((state) => {
						const char = state.characters.find((c) => c.id === charId);
						if (!char) throw new Error("Character not found");

						const taskIndex = char.tasks.findIndex((t) => t.id === taskId);
						if (taskIndex === -1) throw new Error("Task not found");

						char.tasks.splice(taskIndex, 1);

						return { ...state };
					});
				},
				charToggleTask(charId, taskId) {
					set((state) => {
						const char = state.characters.find((c) => c.id === charId);
						if (!char) throw new Error("Character not found");

						const task = char.tasks.find((t) => t.id === taskId);
						if (!task) throw new Error("Task not found");

						const isCompleted = isTaskCompleted(
							task,
							getTaskResetDate(task.type),
						);
						if (isCompleted) {
							task.completedDate = undefined;
						}
						if (!isCompleted) {
							task.completedDate = new Date().toISOString();
						}

						return { ...state };
					});
				},
				restoreCharacter: (char, index) => {
					set((state) => {
						let updatedChars = state.characters;
						updatedChars = [
							...updatedChars.slice(0, index),
							char,
							...updatedChars.slice(index),
						];
						return { ...state, characters: updatedChars };
					});
				},
				restoreData: (data) => {
					const d = zodChars.safeParse(data);
					if (d.success) set(d.data);
					else throw new Error("Data is not valid");
				},
				reorderChars: (charIds) => {
					set((state) => {
						const updatedChars = state.characters.sort((a, b) => {
							return charIds.indexOf(a.id) - charIds.indexOf(b.id);
						});
						return { ...state, characters: updatedChars };
					});
				},
				setGate: (charId, raidId, gateId, completedDate) => {
					set((state) => {
						const charIndex = state.characters.findIndex(
							(c) => c.id === charId,
						);
						if (charIndex === -1) throw new Error("Character not found");
						const assignedRaid =
							state.characters[charIndex].assignedRaids[raidId];
						if (assignedRaid === undefined) throw new Error("Raid not assigned");
						const gate = assignedRaid[gateId];
						if (gate === undefined) throw new Error("Gate not assigned");

						gate.completedDate = completedDate.toISOString();

						return { ...state };
					});
				},
				availableRaids: () => {
					const uniqueAvailable = new Set<string>();
					const result: { raidId: string; difficulty: Difficulty }[] = [];
					const { characters } = get();
					for (const char of characters) {
						for (const [raidId, gates] of Object.entries(char.assignedRaids)) {
							for (const [gateId, gate] of Object.entries(gates)) {
								const resetDate = getGateResetDate(raidId, gateId);
								const completed = gate.completedDate
									? isGateCompleted(new Date(gate.completedDate), resetDate)
									: false;
								if (!completed) {
									const key = `${raidId}:${gate.difficulty}`;
									if (!uniqueAvailable.has(key)) {
										uniqueAvailable.add(key);
										result.push({ raidId, difficulty: gate.difficulty });
									}
								}
							}
						}
					}
					const raidKeys = Object.keys(raids).reverse();
					// Sort by raid order, and if raidIds are the same, by difficulty: Hard > Normal > Solo
					const difficultyOrder: Record<Difficulty, number> = {
						[Difficulty.Hard]: 0,
						[Difficulty.Normal]: 1,
						[Difficulty.Solo]: 2,
					};
					return result.sort((a, b) => {
						const aIndex = raidKeys.indexOf(a.raidId);
						const bIndex = raidKeys.indexOf(b.raidId);
						if (aIndex === -1 || bIndex === -1) return 0; // If not found, keep original order
						if (aIndex !== bIndex) {
							return aIndex - bIndex;
						}
						// If raidIds are the same, sort by difficulty order
						return (difficultyOrder[a.difficulty] ?? 99) - (difficultyOrder[b.difficulty] ?? 99);
					});
				},
			}),
			{
				name: "characters",
				version: 4,
				migrate: (persistedState, version) => {
					// Define types for migration
					interface LegacyCharacter {
						itemLevel: string | number;
						completedRaids?: unknown;
						tasks?: unknown[];
						raids?: {
							[key: string]: {
								gates: Array<{
									id: string;
									difficulty: Difficulty;
									completedDate?: string;
								}>;
							};
						};
						assignedRaids?: Record<
							string,
							Record<string, { difficulty: Difficulty; completedDate?: string }>
						>;
						isGoldEarner?: boolean;
					}

					interface LegacyState {
						characters: LegacyCharacter[];
					}

					const state = persistedState as LegacyState;

					if (version <= 0) {
						for (const char of state.characters) {
							if (typeof char.itemLevel === "string") {
								char.itemLevel = Number.parseInt(char.itemLevel);
							}
							char.completedRaids = undefined;
						}
					}
					if (version <= 1) {
						for (const char of state.characters) {
							char.tasks = [];
						}
					}
					if (version <= 2) {
						for (const char of state.characters) {
							if (char.raids) {
								char.assignedRaids = Object.entries(char.raids).reduce(
									(accraids, [raidId, raid]) => {
										accraids[raidId] = raid.gates.reduce(
											(accgates, gate) => {
												accgates[gate.id] = {
													difficulty: gate.difficulty,
													completedDate: gate.completedDate,
												};
												return accgates;
											},
											{} as Record<
												string,
												{ difficulty: Difficulty; completedDate?: string }
											>,
										);
										return accraids;
									},
									{} as Record<
										string,
										Record<
											string,
											{ difficulty: Difficulty; completedDate?: string }
										>
									>,
								);
								char.raids = undefined;
							}
						}
					}
					if (version <= 3) {
						state.characters.forEach((char, idx) => {
							char.isGoldEarner = idx < 6;
						});
					}
					return persistedState;
				},
			},
		),
	);

export type SetType = (
	partial:
		| MainStore
		| Partial<MainStore>
		| ((state: MainStore) => MainStore | Partial<MainStore>),
	replace?: boolean | undefined,
) => void;
