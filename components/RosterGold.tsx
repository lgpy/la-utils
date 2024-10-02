"use client";

import { isGateCompleted, raids } from "@/lib/raids";
import { _useMainStore } from "@/providers/MainStoreProvider";
import { zodChar } from "@/stores/main";
import { DateTime } from "luxon";
import { z } from "zod";

function getRosterGold(characters: z.infer<typeof zodChar>[]) {
  const ret = {
    thisWeek: {
      earnedGold: 0,
      totalGold: 0,
    },
    nextWeek: {
      earnableGold: 0,
    },
  };

  characters.forEach((char) => {
    Object.entries(char.raids).forEach(([raidId, raidData]) => {
      const raid = raids.find((r) => r.id === raidId);
      if (!raid) {
        return;
      }

      raidData.gates.forEach((gate) => {
        const DiffIdx = raid.difficulties.indexOf(gate.difficulty);
        const actualGate = raid.gates[gate.id];
        const gateGoldReward = actualGate.rewards.gold[DiffIdx];

        ret.thisWeek.totalGold += gateGoldReward;
        const isCompleted =
          gate.completedDate !== undefined
            ? isGateCompleted(
                raidId,
                gate.id,
                DateTime.fromISO(gate.completedDate),
              )
            : false;

        if (isCompleted) {
          ret.thisWeek.earnedGold += gateGoldReward;
        }
        if (
          actualGate.hasReset === undefined ||
          gate.completedDate === undefined
        ) {
          //ignore weekly reset
          ret.nextWeek.earnableGold += gateGoldReward;
        } else {
          const isGateComplete = isGateCompleted(
            raidId,
            gate.id,
            DateTime.fromISO(gate.completedDate),
            DateTime.now().plus({ week: 1 }),
          );
          if (!isGateComplete) ret.nextWeek.earnableGold += gateGoldReward;
          else console.log("gate Not available next week", gate.id);
        }
      });
    });
  });

  return ret;
}

export default function RosterGold() {
  const { hasHydrated, store: state } = _useMainStore((store) => store);

  const rosterGold = getRosterGold(state.characters);

  if (!hasHydrated) {
    return null;
  }

  const fmt = (gold: number) =>
    gold > 1000 ? `${(gold / 1000).toFixed(gold % 1000 === 0 ? 0 : 1)}k` : gold;

  return (
    <div className="grid grid-cols-2 gap-x-2 fixed left-4 bottom-4 -z-10 text-yellow/60">
      <h2 className="col-span-2 text-xl font-bold">Roster Gold</h2>
      <span className="font-extralight">This Week:</span>
      <span>
        {fmt(rosterGold.thisWeek.earnedGold)}/
        {fmt(rosterGold.thisWeek.totalGold)}
      </span>
      <span className="font-extralight">Next Week:</span>
      <span>{fmt(rosterGold.nextWeek.earnableGold)}</span>
    </div>
  );
}
