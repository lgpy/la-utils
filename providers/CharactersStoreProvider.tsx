"use client";

import { createCharactersStore, CharactersStore } from "@/stores/character";
import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

export type CharactersStoreApi = ReturnType<typeof createCharactersStore>;

export const CharactersStoreContext = createContext<
  CharactersStoreApi | undefined
>(undefined);

export interface CharactersStoreProviderProps {
  children: ReactNode;
}

export const CharactersStoreProvider = ({
  children,
}: CharactersStoreProviderProps) => {
  const storeRef = useRef<CharactersStoreApi>();
  if (!storeRef.current) {
    storeRef.current = createCharactersStore();
  }

  return (
    <CharactersStoreContext.Provider value={storeRef.current}>
      {children}
    </CharactersStoreContext.Provider>
  );
};

export const useCharactersStore = <T,>(
  selector: (store: CharactersStore) => T,
): T => {
  const counterStoreContext = useContext(CharactersStoreContext);

  if (!counterStoreContext) {
    throw new Error(
      `useCharactersStore must be used within CharactersStoreProvider`,
    );
  }

  return useStore(counterStoreContext, selector);
};
