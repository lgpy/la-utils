"use client";

import { createMainStore, MainStore } from "@/stores/main";
import {
  type ReactNode,
  createContext,
  useRef,
  useContext,
  use,
  useEffect,
  useState,
} from "react";
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

export const _useMainStore = <T,>(
  selector: (store: MainStore) => T,
): { store: T; hasHydrated: boolean } => {
  const mainStoreContext = useContext(MainStoreContext);
  const [hydrated, setHydrated] = useState(false);

  if (!mainStoreContext) {
    throw new Error(`useMainStore must be used within MainStoreProvider`);
  }

  useEffect(() => {
    if (mainStoreContext.persist.hasHydrated) {
      setHydrated(mainStoreContext.persist.hasHydrated());
    }
    mainStoreContext.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, [mainStoreContext.persist]);

  const store = useStore(mainStoreContext, selector);
  return {
    store,
    hasHydrated: hydrated,
  };
};
