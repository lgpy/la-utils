import { zodChar } from "@/stores/main";
import { Difficulty, isGateCompleted, raids } from "./raids";
import { DateTime } from "luxon";
import { z } from "zod";
import { Character } from "@/hooks/mainstore";
import { hasReset } from "./dates";

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

export function getGoldInfo(charRaids: Character["raids"]) {
  return Object.entries(charRaids).reduce(
    (acc, [raidId, raid]) => {
      const actualraid = raids.find((r) => r.id === raidId);
      if (!actualraid) {
        console.error(`Raid ${raidId} not found`);
        return acc;
      }
      const idk = raid.gates.reduce(
        (acc, gate) => {
          const diffIdx = actualraid.difficulties.indexOf(gate.difficulty);
          const actualgate = actualraid.gates[gate.id];
          if (!actualgate) {
            console.error(`Gate ${gate.id} not found in raid ${raidId}`);
            return acc;
          }
          return {
            total: acc.total + actualgate.rewards.gold[diffIdx],
            earned:
              acc.earned +
              (gate.completed ? actualgate.rewards.gold[diffIdx] : 0),
          };
        },
        {
          total: 0,
          earned: 0,
        },
      );
      return {
        total: acc.total + idk.total,
        earned: acc.earned + idk.earned,
      };
    },
    {
      total: 0,
      earned: 0,
    },
  );
}
