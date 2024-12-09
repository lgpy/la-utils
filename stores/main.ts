import { Class } from "@/lib/classes";
import { Difficulty, isGateCompleted, raids } from "@/lib/raids";
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
import { isTaskCompleted } from "@/lib/tasks";
import { DateTime } from "luxon";
import {
  getGateResetDate,
  getLatestWeeklyReset,
  getTaskResetDate,
} from "@/lib/dates";

export const zodTask = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["daily", "weekly"]), //! IF YOU ADD A NEW TASK TYPE, FIX THE CODE TO HANDLE IT
  completedDate: z.string().optional(),
});

export const zodChar = z.object({
  id: z.string(),
  name: z.string(),
  class: z.nativeEnum(Class),
  itemLevel: z.number(),
  isGoldEarner: z.boolean(),
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
  isGoldEarner: true,
});
export const zodEditChar = zodChar.pick({
  name: true,
  class: true,
  itemLevel: true,
  isGoldEarner: true,
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
  toggleGate: (charId: string, raidId: string, gateId: string) => void;
  untoggleGate: (charId: string, raidId: string, gateId: string) => void;
  toggleAllGates: (charId: string, raidId: string) => void;
  untoggleAllGates: (charId: string, raidId: string) => void;
  toggleSingleGate: (charId: string, raidId: string, gateId: string) => void;
  untoggleSingleGate: (charId: string, raidId: string, gateId: string) => void;
  restoreData: (data: MainState) => void;
  charAddTask: (charId: string, task: z.infer<typeof zodNewTask>) => void;
  charEditTask: (
    charId: string,
    taskId: string,
    task: z.infer<typeof zodNewTask>,
  ) => void;
  charDelTask: (charId: string, taskId: string) => void;
  charToggleTask: (charId: string, taskId: string) => void;
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
        toggleGate: (charId, raidId, gateId) => {
          set((state) => {
            const charIndex = state.characters.findIndex(
              (c) => c.id === charId,
            );
            if (charIndex === -1) throw new Error("Character not found");
            const assignedRaid =
              state.characters[charIndex].assignedRaids[raidId];
            if (assignedRaid === undefined) throw new Error("Raid not found");
            const gate = assignedRaid[gateId];
            if (gate === undefined) throw new Error("Gate not found");

            const isCompleted =
              gate.completedDate !== undefined
                ? isGateCompleted(
                    DateTime.fromISO(gate.completedDate),
                    getGateResetDate(raidId, gateId),
                  )
                : false;

            if (isCompleted && !raids[raidId].gates[gateId].isBiWeekly) {
              const gateIndex = Object.keys(assignedRaid).findIndex(
                (g) => g === gateId,
              );
              Object.keys(assignedRaid).forEach((gateId, index) => {
                if (index <= gateIndex) return;
                const actualGate = raids[raidId].gates[gateId];
                if (actualGate.isBiWeekly) {
                  const lastreset = getLatestWeeklyReset();
                  const biweeklyGateIsCompleted =
                    assignedRaid[gateId].completedDate !== undefined
                      ? isGateCompleted(
                          DateTime.fromISO(assignedRaid[gateId].completedDate),
                          getGateResetDate(raidId, gateId),
                        )
                      : false;
                  if (
                    biweeklyGateIsCompleted &&
                    DateTime.fromISO(assignedRaid[gateId].completedDate!) <
                      lastreset
                  ) {
                    return;
                  }
                }
                assignedRaid[gateId].completedDate = undefined;
              });
            } else {
              const gateKeys = Object.keys(assignedRaid);
              const gateIndex = gateKeys.findIndex((gate) => gate === gateId);
              for (let i = 0; i <= gateIndex; i++) {
                if (raids[raidId].gates[gateKeys[i]].isBiWeekly) {
                  const biweeklyGateIsCompleted =
                    assignedRaid[gateKeys[i]].completedDate !== undefined
                      ? isGateCompleted(
                          DateTime.fromISO(
                            assignedRaid[gateKeys[i]].completedDate!,
                          ),
                          getGateResetDate(raidId, gateId),
                        )
                      : false;
                  if (biweeklyGateIsCompleted) {
                    continue;
                  }
                }
                assignedRaid[gateKeys[i]].completedDate =
                  DateTime.now().toISO();
              }
            }

            return { ...state };
          });
        },
        untoggleGate: (charId, raidId, gateId) => {
          set((state) => {
            const charIndex = state.characters.findIndex(
              (c) => c.id === charId,
            );
            if (charIndex === -1) throw new Error("Character not found");
            const assignedRaid =
              state.characters[charIndex].assignedRaids[raidId];
            if (assignedRaid === undefined) throw new Error("Raid not found");
            const gate = assignedRaid[gateId];
            if (gate === undefined) throw new Error("Gate not found");

            const gateKeys = Object.keys(assignedRaid);
            const gateIndex = gateKeys.findIndex((gate) => gate === gateId);
            for (let i = gateIndex; i < gateKeys.length; i++) {
              const gateKey = gateKeys[i];
              const aGate = assignedRaid[gateKey];
              if (
                raids[raidId].gates[gateKey].isBiWeekly &&
                gateKey !== gateId
              ) {
                const lastreset = getLatestWeeklyReset();
                if (aGate.completedDate !== undefined) {
                  const biWeeklyDate = DateTime.fromISO(aGate.completedDate!);
                  const biweeklyGateIsCompleted = isGateCompleted(
                    biWeeklyDate,
                    getGateResetDate(raidId, gateKey),
                  );
                  if (biweeklyGateIsCompleted && biWeeklyDate < lastreset) {
                    continue;
                  }
                }
              }
              aGate.completedDate = undefined;
            }

            return { ...state };
          });
        },
        toggleAllGates: (charId, raidId) => {
          set((state) => {
            const charIndex = state.characters.findIndex(
              (c) => c.id === charId,
            );
            if (charIndex === -1) throw new Error("Character not found");
            const assignedRaid =
              state.characters[charIndex].assignedRaids[raidId];
            if (assignedRaid === undefined) throw new Error("Raid not found");

            const gateKeys = Object.keys(assignedRaid);
            for (let i = 0; i < gateKeys.length; i++) {
              const gateKey = gateKeys[i];
              const aGate = assignedRaid[gateKey];
              if (raids[raidId].gates[gateKey].isBiWeekly) {
                const lastreset = getLatestWeeklyReset();
                if (aGate.completedDate !== undefined) {
                  const biWeeklyDate = DateTime.fromISO(aGate.completedDate!);
                  const biweeklyGateIsCompleted = isGateCompleted(
                    biWeeklyDate,
                    getGateResetDate(raidId, gateKey),
                  );
                  if (biweeklyGateIsCompleted && biWeeklyDate < lastreset) {
                    continue;
                  }
                }
              }
              aGate.completedDate = DateTime.now().toISO();
            }

            return { ...state };
          });
        },
        untoggleAllGates: (charId, raidId) => {
          set((state) => {
            const charIndex = state.characters.findIndex(
              (c) => c.id === charId,
            );
            if (charIndex === -1) throw new Error("Character not found");
            const assignedRaid =
              state.characters[charIndex].assignedRaids[raidId];
            if (assignedRaid === undefined) throw new Error("Raid not found");

            const gateKeys = Object.keys(assignedRaid);
            for (let i = 0; i < gateKeys.length; i++) {
              const gateKey = gateKeys[i];
              const aGate = assignedRaid[gateKey];
              if (raids[raidId].gates[gateKey].isBiWeekly) {
                const lastreset = getLatestWeeklyReset();
                if (aGate.completedDate !== undefined) {
                  const biWeeklyDate = DateTime.fromISO(aGate.completedDate!);
                  const biweeklyGateIsCompleted = isGateCompleted(
                    biWeeklyDate,
                    getGateResetDate(raidId, gateKey),
                  );
                  if (biweeklyGateIsCompleted && biWeeklyDate < lastreset) {
                    continue;
                  }
                }
              }
              aGate.completedDate = undefined;
            }

            return { ...state };
          });
        },
        toggleSingleGate: (charId, raidId, gateId) => {
          set((state) => {
            const charIndex = state.characters.findIndex(
              (c) => c.id === charId,
            );
            if (charIndex === -1) throw new Error("Character not found");
            const assignedRaid =
              state.characters[charIndex].assignedRaids[raidId];
            if (assignedRaid === undefined) throw new Error("Raid not found");
            const gate = assignedRaid[gateId];
            if (gate === undefined) throw new Error("Gate not found");

            gate.completedDate = DateTime.now().toISO();

            return { ...state };
          });
        },
        untoggleSingleGate: (charId, raidId, gateId) => {
          set((state) => {
            const charIndex = state.characters.findIndex(
              (c) => c.id === charId,
            );
            if (charIndex === -1) throw new Error("Character not found");
            const assignedRaid =
              state.characters[charIndex].assignedRaids[raidId];
            if (assignedRaid === undefined) throw new Error("Raid not found");
            const gate = assignedRaid[gateId];
            if (gate === undefined) throw new Error("Gate not found");

            gate.completedDate = undefined;

            return { ...state };
          });
        },
        charAddTask(charId, task) {
          set((state) => {
            const char = state.characters.find((c) => c.id === charId);
            if (!char) throw new Error("Character not found");

            const parsedTask = zodNewTask.parse(task);

            char.tasks.push({
              ...parsedTask,
              id: uuidv4(),
              completedDate: undefined,
            });

            return { ...state };
          });
        },
        charEditTask(charId, taskId, task) {
          set((state) => {
            const char = state.characters.find((c) => c.id === charId);
            if (!char) throw new Error("Character not found");

            const parsedTask = zodNewTask.parse(task);

            const taskIndex = char.tasks.findIndex((t) => t.id === taskId);
            if (taskIndex === -1) throw new Error("Task not found");

            char.tasks[taskIndex] = {
              ...parsedTask,
              id: taskId,
              completedDate: char.tasks[taskIndex].completedDate,
            };

            return { ...state };
          });
        },
        charDelTask(charId, taskId) {
          set((state) => {
            const char = state.characters.find((c) => c.id === charId);
            if (!char) throw new Error("Character not found");

            const taskIndex = char.tasks.findIndex((t) => t.id === taskId);
            if (taskIndex === -1) throw new Error("Task not found");

            char.tasks.splice(taskIndex, 1);

            return { ...state };
          });
        },
        charToggleTask(charId, taskId) {
          set((state) => {
            const char = state.characters.find((c) => c.id === charId);
            if (!char) throw new Error("Character not found");

            const task = char.tasks.find((t) => t.id === taskId);
            if (!task) throw new Error("Task not found");

            const isCompleted = isTaskCompleted(
              task,
              getTaskResetDate(task.type),
            );
            if (isCompleted) {
              task.completedDate = undefined;
            }
            if (!isCompleted) {
              task.completedDate = DateTime.now().toISO();
            }

            return { ...state };
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
        version: 4,
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
          if (version <= 3) {
            (persistedState as { characters: any[] }).characters.forEach(
              (char, idx) => {
                char.isGoldEarner = idx < 6;
              },
            );
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
