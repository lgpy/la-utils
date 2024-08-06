"use client";

import { createCraftingStore, CraftingStore } from "@/stores/crafting";
import {
  type ReactNode,
  createContext,
  useRef,
  useContext,
  useEffect,
  useState,
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
  const storeRef = useRef<CraftingStoreApi>();
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
  const [hydrated, setHydrated] = useState(false);

  if (!craftingStoreContext) {
    throw new Error(
      `useCraftingStore must be used within CraftingStoreProvider`,
    );
  }

  useEffect(() => {
    if (craftingStoreContext.persist.hasHydrated) {
      setHydrated(craftingStoreContext.persist.hasHydrated());
    }
    craftingStoreContext.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, [craftingStoreContext.persist]);

  const store = useStore(craftingStoreContext, selector);

  return {
    store,
    hasHydrated: hydrated,
  };
};
