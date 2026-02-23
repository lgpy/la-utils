"use client";

import { useHydration } from "@/lib/hooks/use-hydration";
import { createPriceStore } from "@/stores/prices-store";
import { type ReactNode, createContext, useContext, useState } from "react";
import { ExtractState, useStore } from "zustand";

export type PriceStoreApi = ReturnType<typeof createPriceStore>;

export const PriceStoreContext = createContext<PriceStoreApi | undefined>(
	undefined
);

export interface PriceStoreProviderProps {
	children: ReactNode;
}

export const PriceStoreProvider = ({ children }: PriceStoreProviderProps) => {
	const [store] = useState(() => createPriceStore());

	return (
		<PriceStoreContext.Provider value={store}>
			{children}
		</PriceStoreContext.Provider>
	);
};

export const usePriceStore = <T,>(
	selector: (store: ExtractState<PriceStoreApi>) => T
): { state: T; hasHydrated: boolean } => {
	const priceStoreContext = useContext(PriceStoreContext);

	if (!priceStoreContext) {
		throw new Error("usePriceStore must be used within PriceStoreProvider");
	}

	const hasHydrated = useHydration(priceStoreContext);

	const store = useStore(priceStoreContext, selector);

	return {
		state: store,
		hasHydrated,
	};
};
