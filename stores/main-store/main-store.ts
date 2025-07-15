import { z } from "zod";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { Difficulty } from "@/generated/prisma";
import { CharacterActions, createCharActions } from "./actions/char";
import { createRaidActions, RaidActions } from "./actions/raid";
import { createTaskActions, TaskActions } from "./actions/task";
import { createMiscActions, MiscActions } from "./actions/misc";
import { immer } from 'zustand/middleware/immer';
import { StateCreator } from "zustand";
import { zodChar } from "./types";


export const zodChars = z.object({
	characters: z.array(zodChar),
});

export type MainState = z.infer<typeof zodChars>;

export type MainStore = MainState & CharacterActions & RaidActions & TaskActions & MiscActions;

export type StateActions<T> = StateCreator<
	MainState,
	[["zustand/immer", never]],
	[],
	T
>

export const createMainStore = () =>
	createStore<MainStore>()(
		persist(
			immer((...a) => ({
				characters: [],
				...createRaidActions(...a),
				...createCharActions(...a),
				...createTaskActions(...a),
				...createMiscActions(...a),
			})),
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
