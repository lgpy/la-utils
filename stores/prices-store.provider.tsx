"use client";

import { useHydration } from "@/hooks/use-hydration";
import { type PricesStore, createPriceStore } from "@/stores/prices-store";
import {
	type ReactNode,
	createContext,
	useContext,
	useMemo,
	useRef,
} from "react";
import { useStore } from "zustand";

export type PriceStoreApi = ReturnType<typeof createPriceStore>;

export const PriceStoreContext = createContext<PriceStoreApi | undefined>(
	undefined,
);

export interface PriceStoreProviderProps {
	children: ReactNode;
}

export const PriceStoreProvider = ({ children }: PriceStoreProviderProps) => {
	const storeRef = useRef<PriceStoreApi>(null);
	if (!storeRef.current) {
		storeRef.current = createPriceStore();
	}

	return (
		<PriceStoreContext.Provider value={storeRef.current}>
			{children}
		</PriceStoreContext.Provider>
	);
};

const _usePriceStore = <T,>(
	selector: (store: PricesStore) => T,
): { store: T; hasHydrated: boolean } => {
	const priceStoreContext = useContext(PriceStoreContext);

	if (!priceStoreContext) {
		throw new Error("usePriceStore must be used within PriceStoreProvider");
	}

	const hasHydrated = useHydration(priceStoreContext);


	const store = useStore(priceStoreContext, selector);

	return {
		store,
		hasHydrated,
	};
};

export const usePriceStore = () => {
	const priceStore = _usePriceStore((store) => store);

	const single_bc_price = useMemo(() => {
		if (!priceStore.hasHydrated)
			return 0;

		const bcItem = priceStore.store.prices.find((item) => item.id === "blue-crystal");
		return (bcItem?.price || 0) / 95;
	}, [priceStore]);

	return {
		store: priceStore.store,
		single_bc_price,
		hasHydrated: priceStore.hasHydrated,
	}
}
