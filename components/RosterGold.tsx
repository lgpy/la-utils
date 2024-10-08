"use client";

import { useMainStore } from "@/hooks/mainstore";
import { getHighest3, parseGoldInfo } from "@/lib/chars";
import { _useMainStore } from "@/providers/MainStoreProvider";
import { useMemo } from "react";

export default function RosterGold() {
  const { hasHydrated, state } = useMainStore();

  const rosterGold = useMemo(() => {
    if (!hasHydrated) {
      return;
    }
    return state.characters.reduce(
      (acc, char, idx) => {
        if (idx >= 6) return acc;
        const goldInfo = parseGoldInfo(char.raids);
        const highest3 = getHighest3(goldInfo);
        Object.values(highest3).forEach((nfo) => {
          acc.thisWeek.earnedGold += nfo.thisWeek.earnedGold;
          acc.thisWeek.totalGold += nfo.thisWeek.totalGold;
          acc.nextWeek.earnableGold += nfo.nextWeek.earnableGold;
        });
        return acc;
      },
      {
        thisWeek: { earnedGold: 0, totalGold: 0 },
        nextWeek: { earnableGold: 0 },
      },
    );
  }, [state.characters, hasHydrated]);

  if (!hasHydrated) {
    return null;
  }

  if (!rosterGold) {
    return null;
  }

  const fmt = (gold: number) =>
    gold > 1000 ? `${(gold / 1000).toFixed(gold % 1000 === 0 ? 0 : 1)}k` : gold;

  return (
    <div className="grid grid-cols-[auto_auto] gap-x-2 fixed left-4 bottom-4 -z-10 text-yellow/60">
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
