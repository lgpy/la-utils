import { Difficulty, isGateCompleted } from "@/lib/raids";
import { _useMainStore } from "@/providers/MainStoreProvider";
import { DateTime } from "luxon";

export const useMainStore = () => {
  const { store, hasHydrated } = _useMainStore((store) => store);

  type AssignedRaids = (typeof store.characters)[number]["assignedRaids"];

  type ExtendedAssignedRaids = {
    [raidId in keyof AssignedRaids]: {
      [gateId in keyof AssignedRaids[raidId]]: AssignedRaids[raidId][gateId] & {
        completed: boolean;
      };
    };
  };

  return {
    state: {
      ...store,
      characters: store.characters.map((character) => ({
        ...character,
        assignedRaids: Object.entries(character.assignedRaids).reduce(
          (acc, [raidId, raid]) => {
            const gates = Object.entries(raid).reduce(
              (gateAcc, [gateId, gate]) => {
                gateAcc[gateId] = {
                  ...gate,
                  completed:
                    gate.completedDate !== undefined
                      ? isGateCompleted(
                          raidId,
                          gateId,
                          DateTime.fromISO(gate.completedDate),
                        )
                      : false,
                };
                return gateAcc;
              },
              {} as ExtendedAssignedRaids[string],
            );
            acc[raidId] = gates;
            return acc;
          },
          {} as ExtendedAssignedRaids,
        ),
      })),
    },
    hasHydrated,
  };
};

export type Character = ReturnType<
  typeof useMainStore
>["state"]["characters"][number];
