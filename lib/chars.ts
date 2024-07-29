import { zodChar } from "@/stores/main";
import { Difficulty, isGateCompleted, raids } from "./raids";
import { DateTime } from "luxon";
import { z } from "zod";

export function getRaids(cRaids: z.infer<typeof zodChar>["raids"]) {
  return Object.entries(cRaids).reduce(
    (acc, [raidId, raid]) => {
      const actualraid = raids.find((r) => r.id === raidId);
      if (!actualraid) {
        console.error(`Raid ${raidId} not found`);
        return acc;
      }
      const gates = raid.gates.map((gate) => ({
        id: gate.id,
        difficulty: gate.difficulty,
        completed:
          gate.completedDate !== undefined
            ? isGateCompleted(
                raidId,
                gate.id,
                DateTime.fromISO(gate.completedDate),
              )
            : false,
      }));

      acc[raidId] = { gates };
      return acc;
    },
    {} as Record<
      string,
      {
        gates: {
          id: string;
          difficulty: Difficulty;
          completed: boolean;
        }[];
      }
    >,
  );
}
