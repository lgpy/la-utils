import { ServerName } from "@/prisma/generated/enums";
import { z } from "zod";
import { createStore } from "zustand";
import { persist } from "zustand/middleware";

const zodSettings = z.object({
	server: z.nativeEnum(ServerName).optional(),
	experiments: z.object({
		ignoreThaemineIfNoG4: z.boolean(),
		autoUpdateRaids: z.boolean(),
	}),
	upload: z.object({
		ignoreRaids: z
			.object({
				cId: z.string(),
				rId: z.string(),
			})
			.array(),
	}),
	friendRaids: z.object({
		filterByRaids: z.boolean(),
		friendFilter: z.string().array(),
	}),
	uiSettings: z.object({
		buttonV2: z.boolean(),
		compactRaidCard: z.boolean(),
		separateTasks: z.boolean(),
		separateTasksPos: z.object({
			x: z.number(),
			y: z.number(),
		}),
		hideCompleted: z.boolean(),
		forceShowCompleted: z.boolean(),
		showSeparatedTasks: z.boolean(),
	}),
});

export type SettingsState = z.infer<typeof zodSettings>;

export type SettingsActions = {
	setServer: (server: ServerName) => void;
	toggleExperiments: (
		key: keyof SettingsState["experiments"],
		value: boolean
	) => void;
	toggleUiSettings: (
		key: keyof SettingsState["uiSettings"],
		value: boolean
	) => void;
	setSeparateTasksPos: (pos: { x: number; y: number }) => void;
	addIgnoreRaid: (cId: string, rId: string) => void;
	removeIgnoreRaid: (cId: string, rId: string) => void;
	togglefilterByRaids: (value: boolean) => void;
	setFriendFilter: (ids: string[]) => void;
	setForceShowCompleted: (value: boolean) => void;
	setShowSeparatedTasks: (value: boolean) => void;
};

export type SettingsStore = SettingsState & SettingsActions;

export const createSettingsStore = () =>
	createStore<SettingsStore>()(
		persist(
			(set) => ({
				server: undefined,
				experiments: {
					ignoreThaemineIfNoG4: false,
					autoUpdateRaids: false,
				},
				upload: {
					ignoreRaids: [],
				},
				friendRaids: {
					filterByRaids: true,
					friendFilter: [],
				},
				uiSettings: {
					buttonV2: true,
					compactRaidCard: false,
					separateTasks: true,
					separateTasksPos: {
						x: 16,
						y: 80,
					},
					hideCompleted: false,
					forceShowCompleted: false,
					showSeparatedTasks: false,
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
				toggleUiSettings(key, value) {
					set((state) => ({
						uiSettings: {
							...state.uiSettings,
							[key]: value,
						},
					}));
				},
				setSeparateTasksPos(pos) {
					set((state) => ({
						uiSettings: {
							...state.uiSettings,
							separateTasksPos: pos,
						},
					}));
				},
				addIgnoreRaid(cId, rId) {
					set((state) => ({
						upload: {
							...state.upload,
							ignoreRaids: [...state.upload.ignoreRaids, { cId, rId }],
						},
					}));
				},
				removeIgnoreRaid(cId, rId) {
					set((state) => ({
						upload: {
							...state.upload,
							ignoreRaids: state.upload.ignoreRaids.filter(
								(r) => r.cId !== cId || r.rId !== rId
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
				setFriendFilter(ids) {
					set((state) => ({
						friendRaids: {
							...state.friendRaids,
							friendFilter: ids,
						},
					}));
				},
				setForceShowCompleted(value) {
					set((state) => ({
						uiSettings: {
							...state.uiSettings,
							forceShowCompleted: value,
						},
					}));
				},
				setShowSeparatedTasks(value) {
					set((state) => ({
						uiSettings: {
							...state.uiSettings,
							showSeparatedTasks: value,
						},
					}));
				},
			}),
			{
				name: "settings",
				version: 13,
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
					if (version <= 9) {
						ps.uiSettings = {
							buttonV2: ps.experiments.buttonV2,
							compactRaidCard: ps.experiments.compactRaidCard,
							separateTasks: ps.experiments.separateTasks,
						};
						ps.experiments.buttonV2 = undefined;
						ps.experiments.compactRaidCard = undefined;
						ps.experiments.separateTasks = undefined;
					}
					if (version <= 10) {
						ps.uiSettings.separateTasksPos = {
							x: 16,
							y: 80,
						};
					}
					if (version <= 11) {
						ps.friendRaids.friendFilter = [];
					}
					if (version <= 12) {
						ps.uiSettings.hideCompleted = false;
					}
					return ps;
				},
				partialize(state) {
					return {
						server: state.server,
						experiments: state.experiments,
						uiSettings: {
							...state.uiSettings,
							forceShowCompleted: undefined,
							showSeparatedTasks: undefined,
						},
						upload: state.upload,
						friendRaids: state.friendRaids,
					};
				}
			}
		)
	);

export type SetType = (
	partial:
		| SettingsStore
		| Partial<SettingsStore>
		| ((state: SettingsStore) => SettingsStore | Partial<SettingsStore>),
	replace?: boolean | undefined
) => void;
