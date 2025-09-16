import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

export interface ChangelogStore {
	lastViewedDate: string | null;
	setLastViewedDate: (date: string) => void;
}

export const createChangelogStore = () =>
	createStore<ChangelogStore>()(
		persist(
			(set) => ({
				lastViewedDate: null,

				setLastViewedDate: (date: string) => {
					set({ lastViewedDate: date });
				},
			}),
			{
				name: "changelog",
				version: 5, // Increment version to clear old cache
			}
		)
	);
