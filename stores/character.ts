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

export type NewCharacter = z.infer<typeof zodNewChar>;
export type EditCharacter = z.infer<typeof zodEditChar>;
export type newTask = z.infer<typeof zodNewTask>;
export type CharactersState = z.infer<typeof zodChars>;
export type Character = z.infer<typeof zodChar>;

export type CharactersActions = {
  createCharacter: (char: NewCharacter) => void;
  restoreCharacter: (char: Character, index: number) => void;
  updateCharacter: (charId: string, char: EditCharacter) => void;
  deleteCharacter: (charId: string) => void;
  charAddRaid: (
    charId: string,
    raid: {
      id: string;
      gates: {
        id: string;
        difficulty: Difficulty;
      }[];
    },
  ) => void;
  charEditRaid: (
    charId: string,
    raid: {
      id: string;
      gates: {
        id: string;
        difficulty: Difficulty;
      }[];
    },
  ) => void;
  charDelRaid: (charId: string, raidId: string) => void;
  raidAction: (action: {
    type: "complete" | "uncomplete";
    charId: string;
    raidId: string;
    mode?: "all" | "last";
  }) => void;
  restoreData: (data: CharactersState) => void;
  addTaskToCharacter: (charId: string, task: newTask) => void;
};

export type CharactersStore = CharactersState & CharactersActions;

export const createCharactersStore = () =>
  createStore<CharactersStore>()(
    persist(
      (set) => ({
        characters: [],
        updateCharacter: (charId, char) => updateCharacter(set, charId, char),
        createCharacter: (char) => CreateCharacter(set, char),
        deleteCharacter: (charId) => deleteCharacter(set, charId),
        charAddRaid: (charId, raid) => charAddRaid(set, charId, raid),
        charEditRaid: (charId, raid) => charEditRaid(set, charId, raid),
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
      }),
      {
        name: "characters",
        version: 2,
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
          return persistedState;
        },
      },
    ),
  );

export type SetType = (
  partial:
    | CharactersStore
    | Partial<CharactersStore>
    | ((state: CharactersStore) => CharactersStore | Partial<CharactersStore>),
  replace?: boolean | undefined,
) => void;
