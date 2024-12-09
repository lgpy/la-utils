"use client";

import { createSettingsStore, SettingsStore } from "@/stores/settings";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useStore } from "zustand";

export type SettingsStoreApi = ReturnType<typeof createSettingsStore>;

export const SettingsStoreContext = createContext<SettingsStoreApi | undefined>(
  undefined,
);

export interface SettingsStoreProviderProps {
  children: ReactNode;
}

export const SettingsStoreProvider = ({
  children,
}: SettingsStoreProviderProps) => {
  const storeRef = useRef<SettingsStoreApi>(null);
  if (!storeRef.current) {
    storeRef.current = createSettingsStore();
  }

  return (
    <SettingsStoreContext.Provider value={storeRef.current}>
      {children}
    </SettingsStoreContext.Provider>
  );
};

export const useSettingsStore = (): SettingsStore & {
  hasHydrated: boolean;
} => {
  const settingsStoreContext = useContext(SettingsStoreContext);
  const [hydrated, setHydrated] = useState(false);

  if (!settingsStoreContext) {
    throw new Error(
      `useSettingsStore must be used within SettingsStoreProvider`,
    );
  }

  useEffect(() => {
    if (settingsStoreContext.persist.hasHydrated) {
      setHydrated(settingsStoreContext.persist.hasHydrated());
    }
    settingsStoreContext.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, [settingsStoreContext.persist]);

  const store = useStore(settingsStoreContext, (s) => s);

  return {
    ...store,
    hasHydrated: hydrated,
  };
};
