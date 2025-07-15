import { Class, Difficulty, TaskType } from "@/generated/prisma";
import z from "zod";

export const zodTask = z.object({
  id: z.string(),
  name: z.string(),
  type: z.nativeEnum(TaskType),
  completedDate: z.string().optional(),
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
        completedDate: z.string().optional(),
      }),
    ),
  ),
  tasks: z.array(zodTask),
});
