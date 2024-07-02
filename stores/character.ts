import { Class } from "@/lib/classes";
import { Difficulty, raids } from "@/lib/raids";
import { devtools, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { v4 as uuidv4 } from "uuid";

export type CharactersState = {
  characters: {
    id: string;
    name: string;
    class: Class;
    itemLevel: number;
    raids: {
      [key: string]: {
        gates: {
          id: string;
          difficulty: Difficulty;
          completedDate?: string;
        }[];
      };
    };
  }[];
};

export type CharactersActions = {
  createCharacter: (char: {
    name: string;
    class: Class;
    itemLevel: number;
  }) => void;
  updateCharacter: (
    id: string,
    char: {
      name: string;
      class: Class;
      itemLevel: number;
    },
  ) => void;
  deleteCharacter: (id: string) => void;
  addRaidToCharacter: (
    id: string,
    raid: {
      id: string;
      gates: {
        id: string;
        difficulty: Difficulty;
      }[];
    },
  ) => void;
  updateRaidInCharacter: (
    id: string,
    raid: {
      id: string;
      gates: {
        id: string;
        difficulty: Difficulty;
        completedDate?: string;
      }[];
    },
  ) => void;
  removeRaidFromCharacter: (id: string, raidId: string) => void;
  completeRaid: (id: string, raidId: string, gateId?: string) => void;
  uncompleteRaid: (id: string, raidId: string, gateId?: string) => void;
};

export type CharactersStore = CharactersState & CharactersActions;

export type Character = CharactersState["characters"][number];

export const createCharactersStore = () =>
  createStore<CharactersStore>()(
    persist(
      (set) => ({
        characters: [],
        updateCharacter: (id, char) => {
          set((state) => {
            let n = 0;
            const updatedChars = state.characters.map((c) => {
              if (c.id === id) {
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
        createCharacter: (char: {
          name: string;
          class: Class;
          itemLevel: number;
        }) => {
          set((state) => {
            return {
              ...state,
              characters: [
                ...state.characters,
                {
                  name: char.name,
                  class: char.class,
                  itemLevel: char.itemLevel,
                  id: uuidv4(),
                  raids: {},
                  completedRaids: {},
                },
              ],
            };
          });
        },
        deleteCharacter: (id) => {
          set((state) => {
            const updatedChars = state.characters.filter((c) => c.id !== id);

            return { ...state, characters: updatedChars };
          });
        },
        addRaidToCharacter: (id, raid) => {
          set((state) => {
            const updatedChars = state.characters.map((c) => {
              if (c.id === id) {
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
        updateRaidInCharacter: (id, raid) => {
          set((state) => {
            const updatedChars = state.characters.map((c) => {
              if (c.id === id) {
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
        removeRaidFromCharacter: (id, raidId) => {
          set((state) => {
            const updatedChars = state.characters.map((c) => {
              if (c.id === id) {
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
        completeRaid: (id, raidId, gateId) => {
          set((state) => {
            const updatedChars = state.characters.map((c) => {
              if (c.id === id) {
                const gates = c.raids[raidId].gates;

                if (!gateId)
                  return {
                    ...c,
                    raids: {
                      ...c.raids,
                      [raidId]: {
                        gates: gates.map((g) => ({
                          ...g,
                          completedDate: new Date().toISOString(),
                        })),
                      },
                    },
                  };
                else
                  return {
                    ...c,
                    raids: {
                      ...c.raids,
                      [raidId]: {
                        gates: gates.map((g) => {
                          if (g.id === gateId) {
                            return {
                              ...g,
                              completedDate: new Date().toISOString(),
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
        uncompleteRaid: (id, raidId, gateId) => {
          set((state) => {
            const updatedChars = state.characters.map((c) => {
              if (c.id === id) {
                const gates = c.raids[raidId].gates;

                if (!gateId)
                  return {
                    ...c,
                    raids: {
                      ...c.raids,
                      [raidId]: {
                        gates: gates.map((g) => ({
                          ...g,
                          completedDate: undefined,
                        })),
                      },
                    },
                  };
                else
                  return {
                    ...c,
                    raids: {
                      ...c.raids,
                      [raidId]: {
                        gates: gates.map((g) => {
                          if (g.id === gateId) {
                            return {
                              ...g,
                              completedDate: undefined,
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
      }),
      { name: "characters" },
    ),
  );
