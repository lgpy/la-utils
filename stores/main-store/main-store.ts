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
import { CharV0, CharV1, CharV2, CharV3, CharV4, migrateCharV0ToV1, migrateCharV1ToV2, migrateCharV2ToV3, migrateCharV3ToV4, migrateCharV4ToV5 } from "./migrations";


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
				version: 5,
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
					if (version <= 4) {
						persistedState = migrateCharV4ToV5(persistedState as CharV4);
					}

					zodChars.parse(persistedState);

					return persistedState;
				},
			},
		),
	);
