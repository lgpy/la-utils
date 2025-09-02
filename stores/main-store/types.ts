import { Class, Difficulty, TaskType } from "@/generated/prisma";
import z from "zod";

export const zodTask = z.object({
  id: z.string(),
  name: z.string(),
  type: z.nativeEnum(TaskType),
  timesToComplete: z.number().min(1),
});

export const zodChar = z.object({
  id: z.string(),
  name: z.string(),
  class: z.nativeEnum(Class),
  itemLevel: z.number(),
  isGoldEarner: z.boolean(),
  assignedRaids: z.record( //raidId
    z.record( //gateId
      z.object({
        difficulty: z.nativeEnum(Difficulty),
        completedDate: z.number().optional(),
      }),
    ),
  ),
  tasks: z.object({
    id: z.string(),
    completions: z.number(),
    completionDate: z.number().optional()
  }).array()
});
