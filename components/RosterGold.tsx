"use client";

import { useMainStore } from "@/hooks/mainstore";
import { getHighest3, parseGoldInfo } from "@/lib/chars";
import { _useMainStore } from "@/providers/MainStoreProvider";
import { useSettingsStore } from "@/providers/SettingsProvider";
import { useMemo } from "react";
import NumberThingy from "./NumberThingy";

export default function RosterGold() {
  const { hasHydrated, state } = useMainStore();
  const { hasHydrated: settingsStoreHidrated, store: settingsStore } =
    useSettingsStore((s) => s);

  const rosterGold = useMemo(() => {
    if (!hasHydrated || !settingsStoreHidrated) {
      return;
    }
    const ret = state.characters.reduce(
      (acc, char) => {
        if (!char.isGoldEarner) return acc;
        const goldInfo = parseGoldInfo(char.assignedRaids);
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
    if (settingsStore.rosterGoldTotal === "remaining") {
      ret.thisWeek.totalGold = -(
        ret.thisWeek.totalGold - ret.thisWeek.earnedGold
      );
    }
    return ret;
  }, [
    state.characters,
    hasHydrated,
    settingsStoreHidrated,
    settingsStore.rosterGoldTotal,
  ]);

  if (!hasHydrated || !settingsStoreHidrated) {
    return null;
  }

  if (!rosterGold) {
    return null;
  }

  const fmt = (gold: number) =>
    Math.abs(gold) > 1000
      ? `${(gold / 1000).toFixed(gold % 1000 === 0 ? 0 : 1)}k`
      : gold;

  return (
    <div className="grid grid-cols-[auto_auto] gap-x-2 fixed left-4 bottom-4 text-yellow/60 select-none">
      <h2 className="col-span-2 text-xl font-bold">Roster Gold</h2>
      <p className="font-extralight">This Week:</p>
      <p
        className="cursor-pointer"
        onClick={() =>
          settingsStore.setRosterGoldTotal(
            settingsStore.rosterGoldTotal === "total" ? "remaining" : "total",
          )
        }
      >
        <NumberThingy n={rosterGold.thisWeek.earnedGold} />/
        <NumberThingy n={rosterGold.thisWeek.totalGold} />
      </p>
      <p className="font-extralight">Next Week:</p>

      <p>
        <NumberThingy n={rosterGold.nextWeek.earnableGold} />
      </p>
    </div>
  );
}
