"use client";

import { useHydration } from "@/hooks/use-hydration";
import {
	getLatestBiWeeklyReset,
	getLatestDailyReset,
	getLatestWeeklyReset,
	getRestedReset,
} from "@/lib/dates";
import { isGateCompleted, raids } from "@/lib/raids";
import { isTaskCompleted } from "@/lib/tasks";
import { type MainStore, createMainStore } from "@/stores/main";
import { type SettingsStore, createSettingsStore } from "@/stores/settings";
import {
	type ReactNode,
	createContext,
	useContext,
	useMemo,
	useRef,
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

	if (!mainStoreContext) {
		throw new Error("useMainStore must be used within MainStoreProvider");
	}


	const hasHydrated = useHydration(mainStoreContext);

	const store = useStore(mainStoreContext, (s) => s);

	const characters = useMemo(() => {
		const weeklyReset = getLatestWeeklyReset();
		const dailyReset = getLatestDailyReset();
		const restedReset = getRestedReset();
		const oddBiWeeklyReset = getLatestBiWeeklyReset("odd");
		const evenBiWeeklyReset = getLatestBiWeeklyReset("even");

		const ret = store.characters.map((character) => ({
			...character,
			assignedRaids: Object.entries(character.assignedRaids).reduce(
				(acc, [raidId, raid]) => {
					const gates = Object.entries(raid).reduce(
						(gateAcc, [gateId, gate]) => {
							if (gate.completedDate === undefined) {
								gateAcc[gateId] = {
									...gate,
									completed: false,
								};
								return gateAcc;
							}

							let resetDate: Date;
							if (raids[raidId].gates[gateId].isBiWeekly === undefined) {
								resetDate = weeklyReset;
							} else if (
								raids[raidId].gates[gateId].isBiWeekly === "odd"
							) {
								resetDate = oddBiWeeklyReset;
							} else {
								resetDate = evenBiWeeklyReset;
							}

							gateAcc[gateId] = {
								...gate,
								completed: isGateCompleted(
									new Date(gate.completedDate),
									resetDate,
								),
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
			tasks: character.tasks.map((task) => {
				if (task.completedDate === undefined)
					return {
						...task,
						completed: false,
					};

				let resetDate: Date;
				switch (task.type) {
					case "daily":
						resetDate = dailyReset;
						break;
					case "rested":
						resetDate = restedReset;
						break;
					case "weekly":
						resetDate = weeklyReset;
						break;
					default:
						const _exhaustiveCheck: never = task.type;
						resetDate = new Date(); // Fallback, should never happen
				}

				return {
					...task,
					completed: isTaskCompleted(task, resetDate),
				};
			}),
		}));
		return ret;
	}, [store]);

	return {
		...store,
		characters,
		hasHydrated,
	};
};

export const useSettingsStore = <T,>(
	selector: (store: SettingsStore) => T,
): {
	state: T;
	hasHydrated: boolean;
} => {
	const settingsStoreContext = useContext(SettingsStoreContext)

	if (!settingsStoreContext) {
		throw new Error(`useSettingsStore must be used within SettingsStoreProvider`)
	}

	const hasHydrated = useHydration(settingsStoreContext);

	return {
		state: useStore(settingsStoreContext, selector),
		hasHydrated,
	}
}

export type Character = ReturnType<typeof useMainStore>["characters"][number];
