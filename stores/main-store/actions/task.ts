import { v4 as uuidv4 } from "uuid";
import { StateActions } from "../main-store";
import z from "zod";
import { isTaskCompleted } from "@/lib/tasks";
import { getIndexOrThrow, getOrThrow } from "@/lib/array";
import { zodTask } from "../types";

export const zodNewTask = zodTask.pick({ name: true, type: true });

export type TaskActions = {
  charAddTask: (charId: string, task: z.infer<typeof zodNewTask>) => void;
  charEditTask: (
    charId: string,
    taskId: string,
    task: z.infer<typeof zodNewTask>,
  ) => void;
  charDelTask: (charId: string, taskId: string) => void;
  charToggleTask: (charId: string, taskId: string) => void;
}

export const createTaskActions: StateActions<TaskActions> = (set) => ({
  charAddTask(charId, task) {
    set((state) => {
      const char = getOrThrow(state.characters, (c) => c.id === charId, "Character not found");

      const parsedTask = zodNewTask.parse(task);

      char.tasks.push({
        ...parsedTask,
        id: uuidv4(),
        completedDate: undefined,
      });
    });
  },
  charEditTask(charId, taskId, task) {
    set((state) => {
      const char = getOrThrow(state.characters, (c) => c.id === charId, "Character not found");
      const taskIndex = getIndexOrThrow(char.tasks, (t) => t.id === taskId, "Task not found");

      const parsedTask = zodNewTask.parse(task);

      char.tasks[taskIndex] = {
        ...parsedTask,
        id: taskId,
        completedDate: char.tasks[taskIndex].completedDate,
      };
    });
  },
  charDelTask(charId, taskId) {
    set((state) => {
      const char = getOrThrow(state.characters, (c) => c.id === charId, "Character not found");
      const taskIndex = getIndexOrThrow(char.tasks, (t) => t.id === taskId, "Task not found");

      char.tasks.splice(taskIndex, 1);
    });
  },
  charToggleTask(charId, taskId) {
    set((state) => {
      const char = getOrThrow(state.characters, (c) => c.id === charId, "Character not found");
      const taskIndex = getIndexOrThrow(char.tasks, (t) => t.id === taskId, "Task not found");

      const task = char.tasks[taskIndex];

      const isCompleted = isTaskCompleted(task);

      if (isCompleted) {
        task.completedDate = undefined;
      } else {
        task.completedDate = new Date().toISOString();
      }
    });
  },
});
