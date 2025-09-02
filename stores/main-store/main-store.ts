import { z } from "zod";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { CharacterActions, createCharActions } from "./actions/char";
import { createRaidActions, RaidActions } from "./actions/raid";
import { createTaskActions, TaskActions } from "./actions/task";
import { createMiscActions, MiscActions } from "./actions/misc";
import { immer } from 'zustand/middleware/immer';
import { StateCreator } from "zustand";
import { zodChar, zodTask } from "./types";
import { CharV0, CharV1, CharV2, CharV3, CharV4, CharV5, CharV6, migrateCharV0ToV1, migrateCharV1ToV2, migrateCharV2ToV3, migrateCharV3ToV4, migrateCharV4ToV5, migrateCharV5ToV6, migrateCharV6ToV7 } from "./migrations";


export const zodChars = z.object({
	characters: z.array(zodChar),
	tasks: z.array(zodTask),
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
				tasks: [],
				...createRaidActions(...a),
				...createCharActions(...a),
				...createTaskActions(...a),
				...createMiscActions(...a),
			})),
			{
				name: "characters",
				version: 7,
				migrate: (persistedState, version) => {
					if (version <= 0) {
						persistedState = migrateCharV0ToV1(persistedState as CharV0);
					}
					if (version <= 1) {
						persistedState = migrateCharV1ToV2(persistedState as CharV1);
					}
					if (version <= 2) {
						persistedState = migrateCharV2ToV3(persistedState as CharV2);
					}
					if (version <= 3) {
						persistedState = migrateCharV3ToV4(persistedState as CharV3);
					}
					if (version <= 4 && (persistedState as any).tasks === undefined) {
						persistedState = migrateCharV4ToV5(persistedState as CharV4);
					}
					if (version <= 5) {
						persistedState = migrateCharV5ToV6(persistedState as CharV5);
					}
					if (version <= 6) {
						persistedState = migrateCharV6ToV7(persistedState as CharV6);
					}

					const parse = zodChars.safeParse(persistedState);

					if (!parse.success) {
						console.error("Zod validation failed:", parse.error);
						throw new Error("Failed to migrate state: Zod validation failed");
					}

					return parse.data;
				},
			},
		),
	);
