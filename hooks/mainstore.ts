import { isGateCompleted } from "@/lib/raids";
import { _useMainStore } from "@/providers/MainStoreProvider";
import { DateTime } from "luxon";

export const useMainStore = () => {
  const { store, hasHydrated } = _useMainStore((store) => store);

  type Raids = (typeof store.characters)[number]["raids"];

  type CompletedRaids = {
    [K in keyof Raids]: {
      [P in keyof Raids[K]]: P extends "gates"
        ? (Raids[K][P][number] & { completed: boolean })[]
        : Raids[K][P];
    };
  };

  return {
    state: {
      ...store,
      characters: store.characters.map((character) => ({
        ...character,
        raids: Object.entries(character.raids).reduce((acc, [raidId, raid]) => {
          const gates = raid.gates.map((gate) => ({
            ...gate,
            completed:
              gate.completedDate !== undefined
                ? isGateCompleted(
                    raidId,
                    gate.id,
                    DateTime.fromISO(gate.completedDate),
                  )
                : false,
          }));
          acc[raidId] = { ...raid, gates };
          return acc;
        }, {} as CompletedRaids),
      })),
    },
    hasHydrated,
  };
};

export type Character = ReturnType<
  typeof useMainStore
>["state"]["characters"][number];
