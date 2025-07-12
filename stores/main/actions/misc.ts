import { Difficulty } from "@/generated/prisma";
import { MainState, StateActions, zodChars } from "..";
import { getGateResetDate } from "@/lib/dates";
import { isGateCompleted, raids } from "@/lib/raids";
import { sortDifficulties } from "@/lib/chars";

export type MiscActions = {
  restoreData: (data: MainState) => void;
  availableRaids: () => {
    raidId: string;
    difficulty: Difficulty;
  }[];
};

export const createMiscActions: StateActions<MiscActions> = (set, get) => ({
  restoreData: (data) => {
    const d = zodChars.safeParse(data);
    if (d.success) set(d.data);
    else throw new Error("Data is not valid");
  },
  availableRaids: () => {
    const uniqueAvailable = new Set<string>();
    const result: { raidId: string; difficulty: Difficulty }[] = [];
    const { characters } = get();
    for (const char of characters) {
      for (const [raidId, gates] of Object.entries(char.assignedRaids)) {
        for (const [gateId, gate] of Object.entries(gates)) {
          const resetDate = getGateResetDate(raidId, gateId);
          const completed = gate.completedDate
            ? isGateCompleted(new Date(gate.completedDate), resetDate)
            : false;
          if (!completed) {
            const key = `${raidId}:${gate.difficulty}`;
            if (!uniqueAvailable.has(key)) {
              uniqueAvailable.add(key);
              result.push({ raidId, difficulty: gate.difficulty });
            }
          }
        }
      }
    }
    const raidKeys = Object.keys(raids).reverse();

    return result.sort((a, b) => {
      const aIndex = raidKeys.indexOf(a.raidId);
      const bIndex = raidKeys.indexOf(b.raidId);
      if (aIndex === -1 || bIndex === -1) return 0; // If not found, keep original order
      if (aIndex !== bIndex) {
        return aIndex - bIndex;
      }
      // If raidIds are the same, sort by difficulty order
      return sortDifficulties(a.difficulty, b.difficulty);
    });
  },
});
