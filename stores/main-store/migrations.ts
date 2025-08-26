import { Class, Difficulty, TaskType } from "@/generated/prisma";
import { similarity } from "@/lib/strings";

export type CharV0 = {
  characters: {
    id: string;
    name: string;
    class: Class;
    itemLevel: string;
    raids: {
      [key: string]: {
        gates: {
          id: string;
          difficulty: Difficulty;
          completedDate?: string;
        }[];
      };
    };
    completedRaids: unknown;
  }[]
}

export type CharV1 = {
  characters: {
    id: string;
    name: string;
    class: Class;
    itemLevel: number; //changed itemLevel from string to number
    raids: {
      [key: string]: {
        gates: {
          id: string;
          difficulty: Difficulty;
          completedDate?: string;
        }[];
      };
    };
    completedRaids: undefined; // removed completedRaids
  }[]
}

export type CharV2 = {
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
    tasks: { //added tasks
      id: string,
      name: string,
      type: TaskType,
      completedDate: string | undefined,
    }[]
  }[]
}

export type CharV3 = {
  characters: {
    id: string;
    name: string;
    class: Class;
    itemLevel: number;
    tasks: {
      id: string,
      name: string,
      type: TaskType,
      completedDate: string | undefined,
    }[]
    assignedRaids: Record< //moved raids to assignedRaids
      string,
      Record<string, { difficulty: Difficulty; completedDate?: string }>
    >;
    raids: undefined; //removed raids
  }[];
}

export type CharV4 = {
  characters: {
    id: string;
    name: string;
    class: Class;
    itemLevel: number;
    tasks: {
      id: string,
      name: string,
      type: TaskType,
      completedDate: string | undefined,
    }[]
    assignedRaids: Record<
      string,
      Record<string, { difficulty: Difficulty; completedDate?: string }>
    >;
    isGoldEarner: boolean; //added isGoldEarner flag
  }[];
}

// move character based tasks to overall state and then assign tasks to characters
export type CharV5 = {
  characters: {
    id: string;
    name: string;
    class: Class;
    itemLevel: number;
    tasks: {
      id: string,
      completions: number,
      completionDate: string | undefined,
    }[]
    assignedRaids: Record<
      string,
      Record<string, { difficulty: Difficulty; completedDate?: string }>
    >;
    isGoldEarner: boolean; //added isGoldEarner flag
  }[];
  tasks: {
    id: string;
    name: string;
    type: TaskType;
    timesToComplete: number;
  }[]
}

export function migrateCharV0ToV1(state: CharV0): CharV1 {
  return {
    ...state,
    characters: state.characters.map(c => ({
      ...c,
      itemLevel: typeof c.itemLevel === "string" ? Number.parseInt(c.itemLevel) : c.itemLevel,
      completedRaids: undefined,
    })),
  };
}

export function migrateCharV1ToV2(state: CharV1): CharV2 {
  return {
    ...state,
    characters: state.characters.map(c => ({
      ...c,
      tasks: [],
    })),
  };
}

export function migrateCharV2ToV3(state: CharV2): CharV3 {
  return {
    ...state,
    characters: state.characters.map(c => ({
      ...c,
      assignedRaids: Object.fromEntries(
        Object.entries(c.raids || {}).map(([raidId, raid]) => [
          raidId,
          Object.fromEntries(
            raid.gates.map((gate) => [
              gate.id,
              {
                difficulty: gate.difficulty,
                completedDate: gate.completedDate,
              },
            ])
          ),
        ])
      ),
      raids: undefined,
    })),
  };
}

export function migrateCharV3ToV4(state: CharV3): CharV4 {
  return {
    ...state,
    characters: state.characters.map((c, idx) => ({
      ...c,
      isGoldEarner: idx < 6,
    })),
  };
}

export function migrateCharV4ToV5(state: CharV4): CharV5 {
  const tasks = state.characters.flatMap(c => c.tasks);
  const uniqueTasks: Array<{
    id: Set<string>,
    newId: string,
    name: string,
    type: TaskType,
  }> = [];

  for (const task of tasks) {
    const dupeIdx = uniqueTasks.findIndex((t) => similarity(t.name.toLowerCase(), task.name.toLowerCase()) > 0.8 && t.type === task.type);
    if (dupeIdx === -1) {
      uniqueTasks.push({
        id: new Set([task.id]),
        newId: task.id,
        name: task.name,
        type: task.type,
      });
    } else {
      uniqueTasks[dupeIdx].id.add(task.id);
    }
  }

  return {
    ...state,
    tasks: uniqueTasks.map(t => ({
      id: t.newId,
      name: t.name,
      type: t.type,
      timesToComplete: 1,
    })),
    characters: state.characters.map(c => ({
      ...c,
      tasks: c.tasks.map(t => {
        const newTask = uniqueTasks.find(ut => ut.id.has(t.id));
        if (!newTask) return null;
        return {
          id: newTask.newId,
          completions: 1,
          completionDate: t.completedDate,
        };
      }).filter((t) => t !== null),
    })),
  };
}
