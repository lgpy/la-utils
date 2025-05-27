"use client";

import { type PricesStore, createPriceStore } from "@/stores/prices";
import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
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

export const usePriceStore = <T,>(
	selector: (store: PricesStore) => T,
): { store: T; hasHydrated: boolean } => {
	const priceStoreContext = useContext(PriceStoreContext);
	const [hydrated, setHydrated] = useState(false);

	if (!priceStoreContext) {
		throw new Error(`usePriceStore must be used within PriceStoreProvider`);
	}

	useEffect(() => {
		if (priceStoreContext.persist.hasHydrated) {
			setHydrated(priceStoreContext.persist.hasHydrated());
		}
		priceStoreContext.persist.onFinishHydration(() => {
			setHydrated(true);
		});
	}, [priceStoreContext.persist]);

	const store = useStore(priceStoreContext, selector);

	return {
		store,
		hasHydrated: hydrated,
	};
};
