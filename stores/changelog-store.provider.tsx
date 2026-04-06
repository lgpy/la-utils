"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore } from "zustand";
import { ChangelogStore, createChangelogStore } from "@/stores/changelog-store";
import { useHydration } from "@/lib/hooks/use-hydration";

export type ChangelogStoreApi = ReturnType<typeof createChangelogStore>;

const ChangelogStoreContext = createContext<ChangelogStoreApi | undefined>(
	undefined
);

export interface ChangelogStoreProviderProps {
	children: ReactNode;
}

export const ChangelogStoreProvider = ({
	children,
}: ChangelogStoreProviderProps) => {
	const [store] = useState(() => createChangelogStore());

	return (
		<ChangelogStoreContext.Provider value={store}>
			{children}
		</ChangelogStoreContext.Provider>
	);
};

export const useChangelogStore = <T,>(
	selector: (store: ChangelogStore) => T
): {
	state: T;
	hasHydrated: boolean;
} => {
	const context = useContext(ChangelogStoreContext);

	if (!context) {
		throw new Error(
			"useChangelogStore must be used within a ChangelogStoreProvider"
		);
	}

	const hasHydrated = useHydration(context);

	const store = useStore(context, selector);

	return {
		state: store,
		hasHydrated,
	};
};
