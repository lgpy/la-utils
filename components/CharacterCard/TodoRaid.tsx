import { raids, shortenDifficulty, shortestDifficulty } from "@/lib/raids";
import { Character } from "@/stores/character";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import TodoRaidCheckbox from "./TodoRaidCheckBox";
import { DateTime } from "luxon";
import { hasReset } from "@/lib/dates";
import { cn } from "@/lib/utils";

interface Props {
  char: Character;
  raidId: string;
}

export default function TodoRaid({ char, raidId }: Props) {
  const raid = raids.find((r) => r.id === raidId);
  const assignedRaid = char.raids[raidId] ?? [];

  if (!assignedRaid || !raid) return null;

  const completed = assignedRaid.gates.filter((ag) => {
    if (!ag.completedDate) return false;
    const actualgate = raid.gates[ag.id];

    if (actualgate.hasReset !== undefined)
      return !actualgate.hasReset(DateTime.fromISO(ag.completedDate));
    else return !hasReset(DateTime.fromISO(ag.completedDate));
  });

  return (
    <div
      className={cn("flex flex-row justify-between items-center gap-2 p-3", {
        "bg-primary/10": completed.length === assignedRaid.gates.length,
      })}
    >
      <div className="flex flex-col grow min-w-0 items-start">
        <span className="">{raid.name}</span>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className="text-muted-foreground text-xs truncate">
                {assignedRaid.gates
                  .map((g) => `${shortestDifficulty(g.difficulty)}`)
                  .join("")}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {assignedRaid.gates
                  .map((g) => `${g.id} ${shortenDifficulty(g.difficulty)}`)
                  .join(", ")}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <TodoRaidCheckbox
        assignedGates={assignedRaid.gates}
        charId={char.id}
        raidId={raidId}
      />
    </div>
  );
}
