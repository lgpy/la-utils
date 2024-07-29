"use client";

import { createMainStore, MainStore } from "@/stores/main";
import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

export type MainStoreApi = ReturnType<typeof createMainStore>;

export const MainStoreContext = createContext<MainStoreApi | undefined>(
  undefined,
);

export interface MainStoreProviderProps {
  children: ReactNode;
}

export const MainStoreProvider = ({ children }: MainStoreProviderProps) => {
  const storeRef = useRef<MainStoreApi>();
  if (!storeRef.current) {
    storeRef.current = createMainStore();
  }

  return (
    <MainStoreContext.Provider value={storeRef.current}>
      {children}
    </MainStoreContext.Provider>
  );
};

export const _useMainStore = <T,>(selector: (store: MainStore) => T): T => {
  const counterStoreContext = useContext(MainStoreContext);

  if (!counterStoreContext) {
    throw new Error(`useMainStore must be used within MainStoreProvider`);
  }

  return useStore(counterStoreContext, selector);
};
