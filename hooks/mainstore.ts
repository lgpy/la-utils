import { getRaids } from "@/lib/chars";
import { _useMainStore } from "@/providers/MainStoreProvider";

export const useMainStore = () => {
  const mainStore = _useMainStore((store) => store);
  return {
    ...mainStore,
    characters: mainStore.characters.map((character) => ({
      ...character,
      raids: getRaids(character.raids),
    })),
  };
};

export type Character = ReturnType<typeof useMainStore>["characters"][number];
