import { Difficulty, isGateCompleted, raids } from "@/lib/raids";
import { SetType } from "./main";
import { DateTime } from "luxon";

export function charAddRaid(
  set: SetType,
  charId: string,
  raidId: string,
  gates: Record<string, Difficulty>,
) {
  set((state) => {
    const char = state.characters.find((c) => c.id === charId);
    if (!char) throw new Error("Character not found");

    char.assignedRaids[raidId] = Object.entries(gates).reduce(
      (acc, [gateId, Diff]) => {
        acc[gateId] = {
          difficulty: Diff,
          completedDate: undefined,
        };
        return acc;
      },
      {} as (typeof char.assignedRaids)[string],
    );

    return { ...state };
  });
}

export function charEditRaid(
  set: SetType,
  charId: string,
  raidId: string,
  gates: Record<string, Difficulty>,
) {
  set((state) => {
    const char = state.characters.find((c) => c.id === charId);
    if (!char) throw new Error("Character not found");

    char.assignedRaids[raidId] = Object.entries(gates).reduce(
      (acc, [gateId, Diff]) => {
        acc[gateId] = {
          difficulty: Diff,
          completedDate: char.assignedRaids[raidId]?.[gateId]?.completedDate,
        };
        return acc;
      },
      {} as (typeof char.assignedRaids)[string],
    );

    return { ...state };
  });
}

export function charDelRaid(set: SetType, charId: string, raidId: string) {
  set((state) => {
    const char = state.characters.find((c) => c.id === charId);
    if (!char) throw new Error("Character not found");

    delete char.assignedRaids[raidId];

    return { ...state };
  });
}

export function raidAction(
  set: SetType,
  {
    type,
    charId,
    raidId,
    mode,
  }: {
    type: "complete" | "uncomplete";
    charId: string;
    raidId: string;
    mode?: "all" | "last";
  },
) {
  set((state) => {
    const char = state.characters.find((c) => c.id === charId);
    if (!char) throw new Error("Character not found");

    const newCompletedDate = (() => {
      switch (type) {
        case "complete":
          return new Date().toISOString();
        case "uncomplete":
          return undefined;
      }
    })();

    if (mode === "all") {
      Object.keys(char.assignedRaids[raidId]).forEach((gateId) => {
        char.assignedRaids[raidId][gateId].completedDate = newCompletedDate;
      });
    } else if (mode === "last" && type === "uncomplete") {
      const lastCompletedGate = Object.entries(
        char.assignedRaids[raidId],
      ).findLast(([gId, g]) => {
        if (g.completedDate === undefined) return false;
        return isGateCompleted(raidId, gId, DateTime.fromISO(g.completedDate));
      });
      if (!lastCompletedGate) throw new Error("No gates to uncomplete");
      char.assignedRaids[raidId][lastCompletedGate[0]].completedDate =
        newCompletedDate;
    } else if (mode === "last" && type === "complete") {
      const firstIncompleteGate = Object.entries(
        char.assignedRaids[raidId],
      ).find(([gId, g]) => {
        if (g.completedDate === undefined) return true;
        return !isGateCompleted(raidId, gId, DateTime.fromISO(g.completedDate));
      });
      if (!firstIncompleteGate) throw new Error("No gates to complete");
      char.assignedRaids[raidId][firstIncompleteGate[0]].completedDate =
        newCompletedDate;
    }

    return { ...state };
  });
}
