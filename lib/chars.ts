import { Character } from "@/hooks/mainstore";
import { DateTime } from "luxon";
import { isGateCompleted, raids } from "./raids";
import { getLatestWeeklyReset } from "./dates";

export function parseGoldInfo(charRaids: Character["assignedRaids"]) {
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

    Object.entries(assignedRaid).forEach(([assignedGateId, assignedGate]) => {
      const actualGate = raid.gates[assignedGateId];
      const gateGoldReward =
        actualGate.difficulties[assignedGate.difficulty]?.rewards.gold || 0;

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

      if (
        assignedGate.completed &&
        actualGate.hasReset !== undefined &&
        assignedGate.completedDate !== undefined
      ) {
        //check if was completed this reset
        const lastReset = getLatestWeeklyReset({});
        if (DateTime.fromISO(assignedGate.completedDate) > lastReset) {
          ret[assignedRaidId].thisWeek.earnedGold += gateGoldReward;
        } else {
          ret[assignedRaidId].thisWeek.totalGold -= gateGoldReward;
        }
      } else if (assignedGate.completed) {
        ret[assignedRaidId].thisWeek.earnedGold += gateGoldReward;
      }

      if (
        actualGate.hasReset === undefined ||
        assignedGate.completedDate === undefined
      ) {
        //ignore weekly reset
        ret[assignedRaidId].nextWeek.earnableGold += gateGoldReward;
      } else {
        const isGateComplete = isGateCompleted(
          assignedRaidId,
          assignedGateId,
          DateTime.fromISO(assignedGate.completedDate),
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
  charRaids: Character["assignedRaids"],
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
  ignoreThaemineIfNoG4: boolean,
) {
  const sortedGold = Object.entries(goldInfo).sort(([aId, a], [bId, b]) => {
    if (
      ignoreThaemineIfNoG4 &&
      charRaids["thaemine"]?.["G4"]?.completedDate !== undefined &&
      (aId === "thaemine" || bId === "thaemine")
    ) {
      const lastReset = getLatestWeeklyReset({});
      if (
        charRaids["thaemine"]["G4"].completed &&
        DateTime.fromISO(charRaids["thaemine"]["G4"].completedDate) < lastReset
      )
        return aId === "thaemine" ? 1 : -1;
    }

    if (a.thisWeek.totalGold === b.thisWeek.totalGold) {
      const aActualIndex = Object.keys(raids).indexOf(aId);
      const bActualIndex = Object.keys(raids).indexOf(bId);
      return bActualIndex - aActualIndex;
    }
    return b.thisWeek.totalGold - a.thisWeek.totalGold;
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

export function sortRaidKeys(a: string, b: string) {
  const keys = Object.keys(raids);
  return keys.indexOf(a) - keys.indexOf(b);
}
