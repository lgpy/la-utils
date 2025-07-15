"use client";

import { useHydration } from "@/hooks/use-hydration";
import { type CraftingStore, createCraftingStore } from "@/stores/crafting-store";
import {
	type ReactNode,
	createContext,
	useContext,
	useRef,
} from "react";
import { useStore } from "zustand";

export type CraftingStoreApi = ReturnType<typeof createCraftingStore>;

export const CraftingStoreContext = createContext<CraftingStoreApi | undefined>(
	undefined,
);

export interface CraftingStoreProviderProps {
	children: ReactNode;
}

export const CraftingStoreProvider = ({
	children,
}: CraftingStoreProviderProps) => {
	const storeRef = useRef<CraftingStoreApi>(null);
	if (!storeRef.current) {
		storeRef.current = createCraftingStore();
	}

	return (
		<CraftingStoreContext.Provider value={storeRef.current}>
			{children}
		</CraftingStoreContext.Provider>
	);
};

export const useCraftingStore = <T,>(
	selector: (store: CraftingStore) => T,
): { store: T; hasHydrated: boolean } => {
	const craftingStoreContext = useContext(CraftingStoreContext);

	if (!craftingStoreContext) {
		throw new Error(
			"useCraftingStore must be used within CraftingStoreProvider",
		);
	}

	const hasHydrated = useHydration(craftingStoreContext);

	const store = useStore(craftingStoreContext, selector);

	return {
		store,
		hasHydrated,
	};
};
