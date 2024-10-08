import { Class } from "@/lib/classes";
import { Difficulty } from "@/lib/raids";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import {
  CreateCharacter,
  deleteCharacter,
  updateCharacter,
} from "./charActions";
import {
  charAddRaid,
  charDelRaid,
  charEditRaid,
  raidAction,
} from "./raidActions";

export const zodTask = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["daily", "weekly"]),
  completedDate: z.string().optional(),
});

export const zodChar = z.object({
  id: z.string(),
  name: z.string(),
  class: z.nativeEnum(Class),
  itemLevel: z.number(),
  assignedRaids: z.record(
    z.record(
      z.object({
        difficulty: z.nativeEnum(Difficulty),
        completedDate: z.string().optional(),
      }),
    ),
  ),
  tasks: z.array(zodTask),
});

const zodChars = z.object({
  characters: z.array(zodChar),
});

export const zodNewChar = zodChar.pick({
  name: true,
  class: true,
  itemLevel: true,
});
export const zodEditChar = zodChar.pick({
  name: true,
  class: true,
  itemLevel: true,
});
export const zodNewTask = zodTask.pick({ name: true, type: true });

export type MainState = z.infer<typeof zodChars>;

export type MainActions = {
  createCharacter: (char: z.infer<typeof zodNewChar>) => void;
  restoreCharacter: (char: z.infer<typeof zodChar>, index: number) => void;
  updateCharacter: (charId: string, char: z.infer<typeof zodEditChar>) => void;
  deleteCharacter: (charId: string) => void;
  charAddRaid: (
    charId: string,
    raidId: string,
    gates: Record<string, Difficulty>,
  ) => void;
  charEditRaid: (
    charId: string,
    raidId: string,
    gates: Record<string, Difficulty>,
  ) => void;
  charDelRaid: (charId: string, raidId: string) => void;
  raidAction: (action: {
    type: "complete" | "uncomplete";
    charId: string;
    raidId: string;
    mode?: "all" | "last";
  }) => void;
  restoreData: (data: MainState) => void;
  addTaskToCharacter: (
    charId: string,
    task: z.infer<typeof zodNewTask>,
  ) => void;
  reorderChars: (charIds: string[]) => void;
};

export type MainStore = MainState & MainActions;

export const createMainStore = () =>
  createStore<MainStore>()(
    persist(
      (set) => ({
        characters: [],
        updateCharacter: (charId, char) => updateCharacter(set, charId, char),
        createCharacter: (char) => CreateCharacter(set, char),
        deleteCharacter: (charId) => deleteCharacter(set, charId),
        charAddRaid: (charId, raidId, gates) =>
          charAddRaid(set, charId, raidId, gates),
        charEditRaid: (charId, raidId, gates) =>
          charEditRaid(set, charId, raidId, gates),
        charDelRaid: (charId, raidId) => charDelRaid(set, charId, raidId),
        raidAction: (action) => raidAction(set, action),
        addTaskToCharacter(charId, task) {
          set((state) => {
            const updatedChars = state.characters.map((c) => {
              if (c.id === charId) {
                return {
                  ...c,
                  tasks: [
                    ...c.tasks,
                    {
                      ...task,
                      id: uuidv4(),
                      completedDate: undefined,
                    },
                  ],
                };
              }

              return c;
            });

            return { ...state, characters: updatedChars };
          });
        },
        restoreCharacter: (char, index) => {
          set((state) => {
            let updatedChars = state.characters;
            updatedChars = [
              ...updatedChars.slice(0, index),
              char,
              ...updatedChars.slice(index),
            ];
            return { ...state, characters: updatedChars };
          });
        },
        restoreData: (data) => {
          const d = zodChars.safeParse(data);
          if (d.success) set(d.data);
          else throw new Error("Data is not valid");
        },
        reorderChars: (charIds) => {
          set((state) => {
            const updatedChars = state.characters.sort((a, b) => {
              return charIds.indexOf(a.id) - charIds.indexOf(b.id);
            });
            return { ...state, characters: updatedChars };
          });
        },
      }),
      {
        name: "characters",
        version: 3,
        migrate: (persistedState, version) => {
          if (version <= 0) {
            for (const char of (persistedState as { characters: any[] })
              .characters) {
              if (typeof char.itemLevel === "string") {
                char.itemLevel = parseInt(char.itemLevel);
              }
              delete char.completedRaids;
            }
          }
          if (version <= 1) {
            for (const char of (persistedState as { characters: any[] })
              .characters) {
              char.tasks = [];
            }
          }
          if (version <= 2) {
            for (const char of (persistedState as { characters: any[] })
              .characters) {
              char.assignedRaids = Object.entries(char.raids).reduce(
                (accraids, [raidId, raid]) => {
                  accraids[raidId] = (raid as any).gates.reduce(
                    (accgates: any, gate: any) => {
                      accgates[gate.id] = {
                        difficulty: gate.difficulty,
                        completedDate: gate.completedDate,
                      };
                      return accgates;
                    },
                    {} as any,
                  );
                  return accraids;
                },
                {} as any,
              );
              delete char.raids;
            }
          }
          return persistedState;
        },
      },
    ),
  );

export type SetType = (
  partial:
    | MainStore
    | Partial<MainStore>
    | ((state: MainStore) => MainStore | Partial<MainStore>),
  replace?: boolean | undefined,
) => void;
