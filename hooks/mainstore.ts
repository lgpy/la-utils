import { getRaids } from "@/lib/chars";
import { _useMainStore } from "@/providers/MainStoreProvider";

export const useMainStore = () => {
  const { store, hasHydrated } = _useMainStore((store) => store);
  return {
    state: {
      ...store,
      characters: store.characters.map((character) => ({
        ...character,
        raids: getRaids(character.raids),
      })),
    },
    hasHydrated,
  };
};

export type Character = ReturnType<
  typeof useMainStore
>["state"]["characters"][number];
