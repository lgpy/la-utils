import { Difficulty } from "@/generated/prisma";
import z from "zod";

export const FriendRaidsSchema = z.array(
  z.object({
    raidId: z.string(),
    difficulty: z.nativeEnum(Difficulty),
  })
)
