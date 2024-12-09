"use client";

import { getHighest3, parseGoldInfo } from "@/lib/chars";
import { useSettingsStore } from "@/providers/SettingsProvider";
import { useMemo } from "react";
import AnimatedNumber from "./AnimatedNumber";
import { useMainStore } from "@/providers/MainStoreProvider";

export default function RosterGold() {
  const mainStore = useMainStore();
  const settingsStore = useSettingsStore();

  const rosterGold = useMemo(() => {
    if (!mainStore.hasHydrated || !settingsStore.hasHydrated) {
      return;
    }
    const ret = mainStore.characters.reduce(
      (acc, char) => {
        if (!char.isGoldEarner) return acc;
        const goldInfo = parseGoldInfo(char.assignedRaids);
        const highest3 = getHighest3(
          char.assignedRaids,
          goldInfo,
          settingsStore.experiments.ignoreThaemineIfNoG4,
        );
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
    mainStore.characters,
    mainStore.hasHydrated,
    settingsStore.hasHydrated,
    settingsStore.rosterGoldTotal,
    settingsStore.experiments.ignoreThaemineIfNoG4,
  ]);

  if (!mainStore.hasHydrated || !settingsStore.hasHydrated) {
    return null;
  }

  if (!rosterGold) {
    return null;
  }

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
        <AnimatedNumber n={rosterGold.thisWeek.earnedGold} format="gold" />
        /
        <AnimatedNumber n={rosterGold.thisWeek.totalGold} format="gold" />
      </p>
      <p className="font-extralight">Next Week:</p>

      <p>
        <AnimatedNumber n={rosterGold.nextWeek.earnableGold} format="gold" />
      </p>
    </div>
  );
}
