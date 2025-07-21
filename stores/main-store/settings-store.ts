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
		separateTasks: z.boolean(),
	}),
	upload: z.object({
		ignoreRaids: z.object({
			cId: z.string(),
			rId: z.string(),
		}).array()
	}),
	friendRaids: z.object({
		filterByRaids: z.boolean(),
	})
});

export type SettingsState = z.infer<typeof zodSettings>;

export type SettingsActions = {
	setServer: (server: ServerName) => void;
	toggleExperiments: (
		key: keyof SettingsState["experiments"],
		value: boolean,
	) => void;
	addIgnoreRaid: (cId: string, rId: string) => void;
	removeIgnoreRaid: (cId: string, rId: string) => void;
	togglefilterByRaids: (value: boolean) => void;
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
					separateTasks: false,
				},
				upload: {
					ignoreRaids: [],
				},
				friendRaids: {
					filterByRaids: true,
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
				addIgnoreRaid(cId, rId) {
					set((state) => ({
						upload: {
							...state.upload,
							ignoreRaids: [
								...state.upload.ignoreRaids,
								{ cId, rId },
							],
						},
					}));
				},
				removeIgnoreRaid(cId, rId) {
					set((state) => ({
						upload: {
							...state.upload,
							ignoreRaids: state.upload.ignoreRaids.filter(
								(r) => r.cId !== cId || r.rId !== rId,
							),
						},
					}));
				},
				togglefilterByRaids(value) {
					set((state) => ({
						friendRaids: {
							...state.friendRaids,
							filterByRaids: value,
						},
					}));
				},
			}),
			{
				name: "settings",
				version: 9,
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
					if (version <= 6) {
						ps.upload = {
							ignoreRaids: [],
						};
					}
					if (version <= 7) {
						ps.friendRaids = {
							filterByRaids: true,
						};
					}
					if (version <= 8) {
						ps.experiments.separateTasks = false;
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
