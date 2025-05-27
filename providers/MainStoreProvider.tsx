"use client";

import {
	getLatestBiWeeklyReset,
	getLatestDailyReset,
	getLatestWeeklyReset,
} from "@/lib/dates";
import { isGateCompleted, raids } from "@/lib/raids";
import { isTaskCompleted } from "@/lib/tasks";
import { type MainStore, createMainStore } from "@/stores/main";
import { type SettingsStore, createSettingsStore } from "@/stores/settings";
import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useStore } from "zustand";

export type MainStoreApi = ReturnType<typeof createMainStore>;
export type SettingsStoreApi = ReturnType<typeof createSettingsStore>;

export const MainStoreContext = createContext<MainStoreApi | undefined>(
	undefined,
);

export const SettingsStoreContext = createContext<SettingsStoreApi | undefined>(
	undefined,
);

export interface MainStoreProviderProps {
	children: ReactNode;
}

export const MainStoreProvider = ({ children }: MainStoreProviderProps) => {
	const mainStoreRef = useRef<MainStoreApi>(null);
	if (!mainStoreRef.current) {
		mainStoreRef.current = createMainStore();
	}

	const settingsStoreRef = useRef<SettingsStoreApi>(null);
	if (!settingsStoreRef.current) {
		settingsStoreRef.current = createSettingsStore();
	}

	return (
		<MainStoreContext.Provider value={mainStoreRef.current}>
			<SettingsStoreContext.Provider value={settingsStoreRef.current}>
				{children}
			</SettingsStoreContext.Provider>
		</MainStoreContext.Provider>
	);
};

type AssignedRaids = MainStore["characters"][number]["assignedRaids"];

type ExtendedAssignedRaids = {
	[raidId in keyof AssignedRaids]: {
		[gateId in keyof AssignedRaids[raidId]]: AssignedRaids[raidId][gateId] & {
			completed: boolean;
		};
	};
};

export const useMainStore = () => {
	const mainStoreContext = useContext(MainStoreContext);
	const [hydrated, setHydrated] = useState(false);

	if (!mainStoreContext) {
		throw new Error("useMainStore must be used within MainStoreProvider");
	}

	useEffect(() => {
		if (mainStoreContext.persist.hasHydrated) {
			setHydrated(mainStoreContext.persist.hasHydrated());
		}
		mainStoreContext.persist.onFinishHydration(() => {
			setHydrated(true);
		});
	}, [mainStoreContext.persist]);

	const store = useStore(mainStoreContext, (s) => s);

	const characters = useMemo(() => {
		const weeklyReset = getLatestWeeklyReset();
		const dailyReset = getLatestDailyReset();
		const oddBiWeeklyReset = getLatestBiWeeklyReset("odd");
		const evenBiWeeklyReset = getLatestBiWeeklyReset("even");

		const ret = store.characters.map((character) => ({
			...character,
			assignedRaids: Object.entries(character.assignedRaids).reduce(
				(acc, [raidId, raid]) => {
					const gates = Object.entries(raid).reduce(
						(gateAcc, [gateId, gate]) => {
							gateAcc[gateId] = {
								...gate,
								completed:
									gate.completedDate !== undefined
										? isGateCompleted(
												new Date(gate.completedDate),
												raids[raidId].gates[gateId].isBiWeekly === undefined
													? weeklyReset
													: raids[raidId].gates[gateId].isBiWeekly === "odd"
														? oddBiWeeklyReset
														: evenBiWeeklyReset,
											)
										: false,
							};
							return gateAcc;
						},
						{} as ExtendedAssignedRaids[string],
					);
					acc[raidId] = gates;
					return acc;
				},
				{} as ExtendedAssignedRaids,
			),
			tasks: character.tasks.map((task) => ({
				...task,
				completed:
					task.completedDate !== undefined
						? isTaskCompleted(
								task,
								task.type === "daily" ? dailyReset : weeklyReset,
							)
						: false,
			})),
		}));
		return ret;
	}, [store]);

	return {
		...store,
		characters,
		hasHydrated: hydrated,
	};
};

export const useSettingsStore = (): SettingsStore & {
	hasHydrated: boolean;
} => {
	const settingsStoreContext = useContext(SettingsStoreContext);
	const [hydrated, setHydrated] = useState(false);

	if (!settingsStoreContext) {
		throw new Error("useSettingsStore must be used within MainStoreProvider");
	}

	useEffect(() => {
		if (settingsStoreContext.persist.hasHydrated) {
			setHydrated(settingsStoreContext.persist.hasHydrated());
		}
		settingsStoreContext.persist.onFinishHydration(() => {
			setHydrated(true);
		});
	}, [settingsStoreContext.persist]);

	const store = useStore(settingsStoreContext, (s) => s);

	return {
		...store,
		hasHydrated: hydrated,
	};
};

export type Character = ReturnType<typeof useMainStore>["characters"][number];
