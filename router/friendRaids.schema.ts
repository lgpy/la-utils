import { Difficulty } from "@/generated/prisma";
import z from "zod";

export const FriendRaidsSchema = z.object({
  filterByRaids: z.boolean(),
  raids: z.object({
    raidId: z.string(),
    difficulty: z.nativeEnum(Difficulty),
  }).array(),
})
