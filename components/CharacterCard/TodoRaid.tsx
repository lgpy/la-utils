import { Character } from "@/hooks/mainstore";
import { getRaids } from "@/lib/chars";
import { raids, shortenDifficulty, shortestDifficulty } from "@/lib/raids";
import { cn } from "@/lib/utils";
import { ValueOf } from "next/dist/shared/lib/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import TodoRaidCheckbox from "./TodoRaidCheckBox";

interface Props {
  char: Character;
  raidId: string;
  raid: ValueOf<ReturnType<typeof getRaids>>;
}

export default function TodoRaid({ char, raidId, raid }: Props) {
  const actualraid = raids.find((r) => r.id === raidId);

  if (!actualraid) {
    console.error(`Raid ${raidId} not found`);
    return null;
  }

  const completedlen = raid.gates.reduce(
    (acc, ag) => (ag.completed ? acc + 1 : acc),
    0,
  );

  return (
    <div
      className={cn("flex flex-row justify-between items-center gap-2 p-3", {
        "bg-primary/10": completedlen === raid.gates.length,
      })}
    >
      <div className="flex flex-col grow min-w-0 items-start">
        <span className="">{actualraid.name}</span>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className="text-muted-foreground text-xs truncate">
                {raid.gates
                  .map((g) => `${shortestDifficulty(g.difficulty)}`)
                  .join("")}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {raid.gates
                  .map((g) => `${g.id} ${shortenDifficulty(g.difficulty)}`)
                  .join(", ")}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <TodoRaidCheckbox
        assignedGates={raid.gates}
        charId={char.id}
        raidId={raidId}
      />
    </div>
  );
}
