import { Class } from "@/lib/classes";
import { Difficulty, raids } from "@/lib/raids";
import { devtools, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { hasReset } from "@/lib/dates";
import { DateTime } from "luxon";

const zodChar = z.object({
  id: z.string(),
  name: z.string(),
  class: z.nativeEnum(Class),
  itemLevel: z.number(),
  raids: z.record(
    z.object({
      gates: z.array(
        z.object({
          id: z.string(),
          difficulty: z.nativeEnum(Difficulty),
          completedDate: z.string().optional(),
        }),
      ),
    }),
  ),
});

const zodChars = z.object({
  characters: z.array(zodChar),
});

const zodNewChar = zodChar.pick({ name: true, class: true, itemLevel: true });
const zodEditChar = zodChar.pick({ name: true, class: true, itemLevel: true });

export type CharactersState = z.infer<typeof zodChars>;
export type NewCharacter = z.infer<typeof zodNewChar>;
export type EditCharacter = z.infer<typeof zodEditChar>;
export type Character = z.infer<typeof zodChar>;

export type CharactersActions = {
  createCharacter: (char: NewCharacter) => void;
  restoreCharacter: (char: Character) => void;
  updateCharacter: (charId: string, char: EditCharacter) => void;
  deleteCharacter: (charId: string) => void;
  addRaidToCharacter: (
    charId: string,
    raid: {
      id: string;
      gates: {
        id: string;
        difficulty: Difficulty;
      }[];
    },
  ) => void;
  updateRaidInCharacter: (
    charId: string,
    raid: {
      id: string;
      gates: {
        id: string;
        difficulty: Difficulty;
        completedDate?: string;
      }[];
    },
  ) => void;
  removeRaidFromCharacter: (charId: string, raidId: string) => void;
  raidAction: (action: {
    type: "complete" | "uncomplete";
    charId: string;
    raidId: string;
    mode?: "all" | "last";
  }) => void;
  restoreData: (data: CharactersState) => void;
};

export type CharactersStore = CharactersState & CharactersActions;

export const createCharactersStore = () =>
  createStore<CharactersStore>()(
    persist(
      (set) => ({
        characters: [],
        updateCharacter: (charId, char) => {
          set((state) => {
            let n = 0;
            const updatedChars = state.characters.map((c) => {
              if (c.id === charId) {
                n++;

                return {
                  ...c,
                  ...char,
                  id: c.id,
                };
              }

              return c;
            });

            if (n === 0) {
              throw new Error("Character not found");
            }

            return { ...state, characters: updatedChars };
          });
        },
        createCharacter: (c: z.infer<typeof zodNewChar>) => {
          set((state) => {
            const newc = zodNewChar.parse(c);
            return {
              ...state,
              characters: [
                ...state.characters,
                {
                  name: newc.name,
                  class: newc.class,
                  itemLevel: newc.itemLevel,
                  id: uuidv4(),
                  raids: {},
                  completedRaids: {},
                },
              ],
            };
          });
        },
        restoreCharacter: (char) => {
          set((state) => {
            return {
              ...state,
              characters: [...state.characters, char],
            };
          });
        },
        deleteCharacter: (charId) => {
          set((state) => {
            const updatedChars = state.characters.filter(
              (c) => c.id !== charId,
            );

            return { ...state, characters: updatedChars };
          });
        },
        addRaidToCharacter: (charId, raid) => {
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
        },
        updateRaidInCharacter: (charId, raid) => {
          set((state) => {
            const updatedChars = state.characters.map((c) => {
              if (c.id === charId) {
                return {
                  ...c,
                  raids: {
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
                  },
                };
              }

              return c;
            });

            return { ...state, characters: updatedChars };
          });
        },
        removeRaidFromCharacter: (charId, raidId) => {
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
        },
        raidAction: ({ type, charId, raidId, mode }) => {
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

                const raid = raids.find((r) => r.id === raidId);
                if (!raid) throw new Error("Raid not found");
                let gate;
                if (type === "uncomplete") {
                  //get last completed Gate
                  gate = gates.findLast((g) => {
                    const actualgate = raid.gates[g.id];
                    if (g.completedDate === undefined) return false;
                    return actualgate.hasReset
                      ? !actualgate.hasReset(DateTime.fromISO(g.completedDate))
                      : !hasReset(DateTime.fromISO(g.completedDate));
                  });
                } else {
                  //get first uncompleted Gate
                  gate = gates.find((g) => {
                    const actualgate = raid.gates[g.id];
                    if (g.completedDate === undefined) return true;
                    return actualgate.hasReset
                      ? actualgate.hasReset(DateTime.fromISO(g.completedDate))
                      : hasReset(DateTime.fromISO(g.completedDate));
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
        },
        restoreData: (data) => {
          const d = zodChars.safeParse(data);
          if (d.success) set(d.data);
          else throw new Error("Data is not valid");
        },
      }),
      {
        name: "characters",
        version: 1,
        migrate: (persistedState, version) => {
          if (version === 0) {
            for (const char of (persistedState as { characters: any[] })
              .characters) {
              if (typeof char.itemLevel === "string") {
                char.itemLevel = parseInt(char.itemLevel);
              }
              delete char.completedRaids;
            }
          }
          return persistedState;
        },
      },
    ),
  );
