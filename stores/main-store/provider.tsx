"use client";

import { useHydration } from "@/lib/hooks/use-hydration";
import {
	getLatestBiWeeklyReset,
	getLatestDailyReset,
	getLatestWeeklyReset,
	getRestedReset,
} from "@/lib/dates";
import { isGateCompleted } from "@/lib/raids";
import { getTaskCompletionState } from "@/lib/tasks";
import { createMainStore } from "@/stores/main-store/main-store";
import {
	type SettingsStore,
	createSettingsStore,
} from "@/stores/main-store/settings-store";
import {
	type ReactNode,
	createContext,
	useContext,
	useMemo,
	useRef,
} from "react";
import { useStore } from "zustand";
import { raidData } from "@/lib/game-info";
import { useVersionMismatch } from "@/lib/hooks/use-version-mismatch";

export type MainStoreApi = ReturnType<typeof createMainStore>;
export type SettingsStoreApi = ReturnType<typeof createSettingsStore>;

export const MainStoreContext = createContext<MainStoreApi | undefined>(
	undefined
);

export const SettingsStoreContext = createContext<SettingsStoreApi | undefined>(
	undefined
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

export const useMainStore = () => {
	const mainStoreContext = useContext(MainStoreContext);

	if (!mainStoreContext) {
		throw new Error("useMainStore must be used within MainStoreProvider");
	}

	const hasHydrated = useHydration(mainStoreContext);
	const isOldVersion = useVersionMismatch(mainStoreContext);

	const store = useStore(mainStoreContext, (s) => s);

	const characters = useMemo(() => {
		if (!hasHydrated) return [];

		const weeklyReset = getLatestWeeklyReset();
		const dailyReset = getLatestDailyReset();
		const restedReset = getRestedReset();
		const oddBiWeeklyReset = getLatestBiWeeklyReset("odd");
		const evenBiWeeklyReset = getLatestBiWeeklyReset("even");

		return store.characters.map((character) => ({
			...character,
			assignedRaids: Object.fromEntries(
				Object.entries(character.assignedRaids).map(([raidId, raid]) => {
					return [
						raidId,
						Object.fromEntries(
							Object.entries(raid).map(([gateId, gate]) => {
								if (gate.completedDate === undefined) {
									return [
										gateId,
										{
											...gate,
											completed: false,
										},
									];
								}

								let resetDate: Date;
								const gateData = raidData.get(raidId)?.getGate(gateId);
								if (
									gateData === undefined || // default to weekly if not present
									gateData.isBiWeekly === undefined // weekly
								) {
									resetDate = weeklyReset;
								} else if (gateData.isBiWeekly === "odd") {
									// odd bi-weekly
									resetDate = oddBiWeeklyReset;
								} else {
									// even bi-weekly
									resetDate = evenBiWeeklyReset;
								}

								return [
									gateId,
									{
										...gate,
										completed: isGateCompleted(
											new Date(gate.completedDate),
											resetDate
										),
									},
								];
							})
						),
					];
				})
			),
			tasks: character.tasks
				.map((charTask) => {
					const task = store.tasks.find((t) => t.id === charTask.id);
					if (!task) return null;

					if (charTask.completionDate === undefined)
						return {
							...charTask,
							name: task.name,
							type: task.type,
							completionState: [0, task.timesToComplete],
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
							resetDate = weeklyReset; // Fallback, should never happen
					}

					const [completions, timesToComplete] = getTaskCompletionState(
						task,
						charTask.completionDate,
						charTask.completions,
						resetDate
					);

					return {
						...charTask,
						name: task.name,
						type: task.type,
						completionState: [completions, timesToComplete],
						completed: completions >= timesToComplete,
					};
				})
				.filter((t) => t !== null),
		}));
	}, [store.characters, store.tasks, hasHydrated]);

	return {
		...store,
		characters,
		hasHydrated,
		rehydrate: mainStoreContext.persist?.rehydrate,
		isOldVersion,
	};
};

export const useSettingsStore = <T,>(
	selector: (store: SettingsStore) => T
): {
	state: T;
	hasHydrated: boolean;
} => {
	const settingsStoreContext = useContext(SettingsStoreContext);

	if (!settingsStoreContext) {
		throw new Error(
			`useSettingsStore must be used within SettingsStoreProvider`
		);
	}

	const hasHydrated = useHydration(settingsStoreContext);

	return {
		state: useStore(settingsStoreContext, selector),
		hasHydrated,
	};
};

export type Character = ReturnType<typeof useMainStore>["characters"][number];
