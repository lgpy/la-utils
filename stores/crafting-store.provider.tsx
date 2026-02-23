"use client";

import { useHydration } from "@/lib/hooks/use-hydration";
import {
	type CraftingStore,
	createCraftingStore,
} from "@/stores/crafting-store";
import { type ReactNode, createContext, useContext, useState } from "react";
import { useStore } from "zustand";

export type CraftingStoreApi = ReturnType<typeof createCraftingStore>;

export const CraftingStoreContext = createContext<CraftingStoreApi | undefined>(
	undefined
);

export interface CraftingStoreProviderProps {
	children: ReactNode;
}

export const CraftingStoreProvider = ({
	children,
}: CraftingStoreProviderProps) => {
	const [store] = useState(() => createCraftingStore());

	return (
		<CraftingStoreContext.Provider value={store}>
			{children}
		</CraftingStoreContext.Provider>
	);
};

export const useCraftingStore = <T,>(
	selector: (store: CraftingStore) => T
): { state: T; hasHydrated: boolean } => {
	const context = useContext(CraftingStoreContext);

	if (!context) {
		throw new Error(
			"useCraftingStore must be used within CraftingStoreProvider"
		);
	}

	const hasHydrated = useHydration(context);

	const store = useStore(context, selector);

	return {
		state: store,
		hasHydrated,
	};
};
