import { ServerName } from "@/generated/prisma";
import { z } from "zod";
import { createStore } from "zustand";
import { persist } from "zustand/middleware";

const zodSettings = z.object({
	server: z
		.nativeEnum(ServerName)
		.optional(),
	experiments: z.object({
		buttonV2: z.boolean(),
		ignoreThaemineIfNoG4: z.boolean(),
		compactRaidCard: z.boolean(),
		autoUpdateRaids: z.boolean(),
	}),
});

export type SettingsState = z.infer<typeof zodSettings>;

export type SettingsActions = {
	setServer: (server: ServerName) => void;
	toggleExperiments: (
		key: keyof SettingsState["experiments"],
		value: boolean,
	) => void;
};

export type SettingsStore = SettingsState & SettingsActions;

export const createSettingsStore = () =>
	createStore<SettingsStore>()(
		persist(
			(set) => ({
				server: undefined,
				experiments: {
					buttonV2: false,
					ignoreThaemineIfNoG4: false,
					compactRaidCard: false,
					autoUpdateRaids: false,
				},
				setServer(server) {
					set({ server });
				},
				toggleExperiments(key, value) {
					set((state) => ({
						experiments: {
							...state.experiments,
							[key]: value,
						},
					}));
				},
			}),
			{
				name: "settings",
				version: 6,
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				migrate: (ps: any, version) => {
					if (version <= 0) ps.rosterGoldTotal = "total";
					if (ps.experiments === undefined) ps.experiments = {};
					if (version <= 1) ps.experiments.buttonV2 = false;
					if (version <= 2) ps.experiments.ignoreThaemineIfNoG4 = false;
					if (version <= 3) ps.experiments.compactRaidCard = false;
					if (version <= 4) ps.rosterGoldTotal = undefined;
					if (version <= 5) {
						ps.experiments.autoUpdateRaids = false;
					}
					return ps;
				},
			},
		),
	);

export type SetType = (
	partial:
		| SettingsStore
		| Partial<SettingsStore>
		| ((state: SettingsStore) => SettingsStore | Partial<SettingsStore>),
	replace?: boolean | undefined,
) => void;
