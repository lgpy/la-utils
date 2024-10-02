"use client";

import { createServerStore, ServerStore } from "@/stores/server";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useStore } from "zustand";

export type ServerStoreApi = ReturnType<typeof createServerStore>;

export const ServerStoreContext = createContext<ServerStoreApi | undefined>(
  undefined,
);

export interface ServerStoreProviderProps {
  children: ReactNode;
}

export const ServerStoreProvider = ({ children }: ServerStoreProviderProps) => {
  const storeRef = useRef<ServerStoreApi>();
  if (!storeRef.current) {
    storeRef.current = createServerStore();
  }

  return (
    <ServerStoreContext.Provider value={storeRef.current}>
      {children}
    </ServerStoreContext.Provider>
  );
};

export const useServerStore = <T,>(
  selector: (store: ServerStore) => T,
): { store: T; hasHydrated: boolean } => {
  const serverStoreContext = useContext(ServerStoreContext);
  const [hydrated, setHydrated] = useState(false);

  if (!serverStoreContext) {
    throw new Error(`useServerStore must be used within ServerStoreProvider`);
  }

  useEffect(() => {
    if (serverStoreContext.persist.hasHydrated) {
      setHydrated(serverStoreContext.persist.hasHydrated());
    }
    serverStoreContext.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, [serverStoreContext.persist]);

  const store = useStore(serverStoreContext, selector);

  return {
    store,
    hasHydrated: hydrated,
  };
};
