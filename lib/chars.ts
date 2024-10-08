import { Character } from "@/hooks/mainstore";
import { DateTime } from "luxon";
import { isGateCompleted, raids } from "./raids";

export function parseGoldInfo(charRaids: Character["raids"]): Record<
  string,
  {
    thisWeek: {
      earnedGold: number;
      totalGold: number;
    };
    nextWeek: {
      earnableGold: number;
    };
  }
> {
  const ret = {} as Record<
    string,
    {
      thisWeek: {
        earnedGold: number;
        totalGold: number;
      };
      nextWeek: {
        earnableGold: number;
      };
    }
  >;

  Object.entries(charRaids).forEach(([assignedRaidId, assignedRaid]) => {
    const raid = raids[assignedRaidId];
    if (!raid) return;

    assignedRaid.gates.forEach((gate) => {
      const actualGate = raid.gates[gate.id];
      const gateGoldReward =
        actualGate.difficulties[gate.difficulty]?.rewards.gold || 0;

      if (ret[assignedRaidId] === undefined) {
        ret[assignedRaidId] = {
          thisWeek: {
            earnedGold: 0,
            totalGold: 0,
          },
          nextWeek: {
            earnableGold: 0,
          },
        };
      }

      ret[assignedRaidId].thisWeek.totalGold += gateGoldReward;

      if (gate.completed) {
        ret[assignedRaidId].thisWeek.earnedGold += gateGoldReward;
      }
      if (
        actualGate.hasReset === undefined ||
        gate.completedDate === undefined
      ) {
        //ignore weekly reset
        ret[assignedRaidId].nextWeek.earnableGold += gateGoldReward;
      } else {
        const isGateComplete = isGateCompleted(
          assignedRaidId,
          gate.id,
          DateTime.fromISO(gate.completedDate),
          DateTime.now().plus({ week: 1 }),
        );
        if (!isGateComplete)
          ret[assignedRaidId].nextWeek.earnableGold += gateGoldReward;
      }
    });
  });
  return ret;
}

export function getHighest3(
  goldInfo: Record<
    string,
    {
      thisWeek: {
        earnedGold: number;
        totalGold: number;
      };
      nextWeek: {
        earnableGold: number;
      };
    }
  >,
) {
  const sortedGold = Object.entries(goldInfo).sort(([aId, a], [bId, b]) => {
    if (a.thisWeek.earnedGold === b.thisWeek.earnedGold) {
      const aActualIndex = Object.keys(raids).indexOf(aId);
      const bActualIndex = Object.keys(raids).indexOf(bId);
      return bActualIndex - aActualIndex;
    }
    return b.thisWeek.earnedGold - a.thisWeek.earnedGold;
  });

  return sortedGold.slice(0, 3).reduce(
    (acc, [raidId, info]) => {
      return Object.assign(acc, { [raidId]: info });
    },
    {} as Record<
      string,
      {
        thisWeek: {
          earnedGold: number;
          totalGold: number;
        };
        nextWeek: {
          earnableGold: number;
        };
      }
    >,
  );
}
