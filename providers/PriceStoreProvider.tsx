"use client";

import { createPriceStore, PricesStore } from "@/stores/prices";
import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

export type PriceStoreApi = ReturnType<typeof createPriceStore>;

export const PriceStoreContext = createContext<PriceStoreApi | undefined>(
  undefined,
);

export interface PriceStoreProviderProps {
  children: ReactNode;
}

export const PriceStoreProvider = ({ children }: PriceStoreProviderProps) => {
  const storeRef = useRef<PriceStoreApi>();
  if (!storeRef.current) {
    storeRef.current = createPriceStore();
  }

  return (
    <PriceStoreContext.Provider value={storeRef.current}>
      {children}
    </PriceStoreContext.Provider>
  );
};

export const usePriceStore = <T,>(selector: (store: PricesStore) => T): T => {
  const counterStoreContext = useContext(PriceStoreContext);

  if (!counterStoreContext) {
    throw new Error(`usePriceStore must be used within PriceStoreProvider`);
  }

  return useStore(counterStoreContext, selector);
};
