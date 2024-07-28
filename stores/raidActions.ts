import { Difficulty, isGateCompleted, raids } from "@/lib/raids";
import { SetType } from "./character";
import { DateTime } from "luxon";

export function charAddRaid(
  set: SetType,
  charId: string,
  raid: {
    id: string;
    gates: {
      id: string;
      difficulty: Difficulty;
    }[];
  },
) {
  set((state) => {
    const updatedChars = state.characters.map((c) => {
      if (c.id === charId) {
        if (Object.keys(c.raids).includes(raid.id)) return c;
        //insert the new raid in the correct order based on the raids object in the utils/raids.ts file
        const newRaids = {
          ...c.raids,
          [raid.id]: {
            gates: raid.gates.sort((a, b) => {
              const araid = raids.find((r) => r.id === raid.id);

              if (!araid) return 0;
              const gateA = Object.keys(araid.gates).indexOf(a.id);
              const gateB = Object.keys(araid.gates).indexOf(b.id);

              return gateA - gateB;
            }),
          },
        };

        const sortedRaids = Object.entries(newRaids)
          .sort(
            ([a], [b]) =>
              raids.findIndex((r) => r.id === a) -
              raids.findIndex((r) => r.id === b),
          )
          .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

        return {
          ...c,
          raids: sortedRaids,
        };
      }

      return c;
    });

    return { ...state, characters: updatedChars };
  });
}

export function charEditRaid(
  set: SetType,
  charId: string,
  raid: {
    id: string;
    gates: {
      id: string;
      difficulty: Difficulty;
    }[];
  },
) {
  set((state) => {
    const updatedChars = state.characters.map((c) => {
      if (c.id === charId) {
        return {
          ...c,
          raids: {
            ...c.raids,
            [raid.id]: {
              gates: raid.gates
                .sort((a, b) => {
                  const araid = raids.find((r) => r.id === raid.id);

                  if (!araid) return 0;
                  const gateA = Object.keys(araid.gates).indexOf(a.id);
                  const gateB = Object.keys(araid.gates).indexOf(b.id);

                  return gateA - gateB;
                })
                .map((g) => {
                  const oldGate = c.raids[raid.id].gates.find(
                    (og) => og.id === g.id,
                  );
                  return {
                    ...g,
                    completedDate: oldGate?.completedDate,
                  };
                }),
            },
          },
        };
      }

      return c;
    });

    return { ...state, characters: updatedChars };
  });
}

export function charDelRaid(set: SetType, charId: string, raidId: string) {
  set((state) => {
    const updatedChars = state.characters.map((c) => {
      if (c.id === charId) {
        const updatedRaids = { ...c.raids };

        delete updatedRaids[raidId];

        return {
          ...c,
          raids: updatedRaids,
        };
      }

      return c;
    });

    return { ...state, characters: updatedChars };
  });
}

export function raidAction(
  set: SetType,
  {
    type,
    charId,
    raidId,
    mode,
  }: {
    type: "complete" | "uncomplete";
    charId: string;
    raidId: string;
    mode?: "all" | "last";
  },
) {
  set((state) => {
    const updatedChars = state.characters.map((c) => {
      if (c.id === charId) {
        const gates = c.raids[raidId].gates;

        const newCompletedDate = (() => {
          switch (type) {
            case "complete":
              return new Date().toISOString();
            case "uncomplete":
              return undefined;
          }
        })();

        if (mode === "all") {
          return {
            ...c,
            raids: {
              ...c.raids,
              [raidId]: {
                gates: gates.map((g) => ({
                  ...g,
                  completedDate: newCompletedDate,
                })),
              },
            },
          };
        }

        let gate;
        if (type === "uncomplete") {
          //get last completed Gate
          gate = gates.findLast((g) => {
            if (g.completedDate === undefined) return false;
            return isGateCompleted(
              raidId,
              g.id,
              DateTime.fromISO(g.completedDate),
            );
          });
        } else {
          //get first uncompleted Gate
          gate = gates.find((g) => {
            if (g.completedDate === undefined) return true;
            return !isGateCompleted(
              raidId,
              g.id,
              DateTime.fromISO(g.completedDate),
            );
          });
        }
        if (!gate)
          throw new Error(
            type === "uncomplete"
              ? "No gates to uncomplete"
              : "No gates to complete",
          );
        return {
          ...c,
          raids: {
            ...c.raids,
            [raidId]: {
              gates: gates.map((g) => {
                if (g.id === gate.id) {
                  return {
                    ...g,
                    completedDate: newCompletedDate,
                  };
                }

                return g;
              }),
            },
          },
        };
      }

      return c;
    });

    return { ...state, characters: updatedChars };
  });
}
