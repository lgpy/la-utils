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
  charAssignTasks: (charId: string, taskIds: string[]) => void;
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
  charAssignTasks(charId, taskIds) {
    set((state) => {
      const char = getOrThrow(state.characters, (c) => c.id === charId, "Character not found");

      //remove tasks
      const tasksToRemove = char.tasks.filter((t) => !taskIds.includes(t.id));
      for (const task of tasksToRemove) {
        const index = char.tasks.findIndex((t) => t.id === task.id);
        if (index !== -1) {
          char.tasks.splice(index, 1);
        } else {
          throw new Error("Failed to Assign Tasks");
        }
      }

      //add tasks
      const tasksToAdd = taskIds.filter((id) => !char.tasks.some((t) => t.id === id));
      for (const taskId of tasksToAdd) {
        char.tasks.push({
          id: taskId,
          completions: 0,
        });
      }

      //sort based tasks based on taskIds array
      char.tasks.sort((a, b) => {
        const aIndex = taskIds.indexOf(a.id);
        const bIndex = taskIds.indexOf(b.id);
        return aIndex - bIndex;
      });
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
