import { v4 as uuidv4 } from "uuid";
import { StateActions } from "../main-store";
import z from "zod";
import { getTaskCompletionState } from "@/lib/tasks";
import { getIndexOrThrow, getOrThrow } from "@/lib/array";
import { zodTask } from "../types";

export const zodNewTask = zodTask.pick({ name: true, type: true, timesToComplete: true });

export type TaskActions = {
  addTask: (task: z.infer<typeof zodNewTask>) => void;
  editTask: (taskId: string, task: z.infer<typeof zodNewTask>) => void;
  delTask: (taskId: string) => void;
  charAddTasks: (charId: string, taskIds: string[]) => void;
  charDelTasks: (charId: string, taskIds: string[]) => void;
  charCompleteTask: (charId: string, taskId: string, fully?: boolean) => void;
  charIncompleteTask: (charId: string, taskId: string, fully?: boolean) => void;
}

export const createTaskActions: StateActions<TaskActions> = (set) => ({
  addTask(task) {
    set((state) => {
      const parsedTask = zodNewTask.parse(task);
      state.tasks.push({
        ...parsedTask,
        id: uuidv4(),
      });
    });
  },
  editTask(taskId, task) {
    set((state) => {
      const taskIndex = getIndexOrThrow(state.tasks, (t) => t.id === taskId, "Task not found");
      const parsedTask = zodNewTask.parse(task);
      state.tasks[taskIndex] = {
        ...parsedTask,
        id: taskId,
      };
    });
  },
  delTask(taskId) {
    set((state) => {
      const taskIndex = getIndexOrThrow(state.tasks, (t) => t.id === taskId, "Task not found");
      state.tasks.splice(taskIndex, 1);
      state.characters.forEach((char) => {
        const charTaskIndex = char.tasks.findIndex((t) => t.id === taskId);
        if (charTaskIndex !== -1) {
          char.tasks.splice(charTaskIndex, 1);
        }
      });
    });
  },
  charAddTasks(charId, taskIDs) {
    set((state) => {
      const char = getOrThrow(state.characters, (c) => c.id === charId, "Character not found");

      for (const taskId of taskIDs) {
        const hasTaskAlready = char.tasks.some((t) => t.id === taskId);

        if (hasTaskAlready) {
          throw new Error("Character already has this task");
        }

        char.tasks.push({
          id: taskId,
          completions: 0,
        });
      }
    });
  },
  charDelTasks(charId, taskIds) {
    set((state) => {
      const char = getOrThrow(state.characters, (c) => c.id === charId, "Character not found");
      for (const taskId of taskIds) {
        const taskIndex = getIndexOrThrow(char.tasks, (t) => t.id === taskId, "Task not found");

        char.tasks.splice(taskIndex, 1);
      }
    });
  },
  charCompleteTask(charId, taskId, fully = false) {
    set((state) => {
      const char = getOrThrow(state.characters, (c) => c.id === charId, "Character not found");
      const task = getOrThrow(state.tasks, (t) => t.id === taskId, "Task not found");
      const charTask = getOrThrow(char.tasks, (t) => t.id === taskId, "Task not assigned");

      const [completions, timesToComplete] = getTaskCompletionState(task, charTask.completionDate, charTask.completions);
      if (completions < timesToComplete) {
        charTask.completionDate = new Date().toISOString();
        charTask.completions = fully ? timesToComplete : completions + 1;
      }
    });
  },
  charIncompleteTask(charId, taskId, fully = false) {
    set((state) => {
      const char = getOrThrow(state.characters, (c) => c.id === charId, "Character not found");
      const charTask = getOrThrow(char.tasks, (t) => t.id === taskId, "Task not assigned");

      if (charTask.completions > 0) {
        charTask.completionDate = new Date().toISOString();
        charTask.completions = fully ? 0 : charTask.completions - 1;
      }
    });
  },
});
