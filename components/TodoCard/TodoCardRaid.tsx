import { Character } from "@/hooks/mainstore";
import { raids, shortenDifficulty, shortestDifficulty } from "@/lib/raids";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TodoCardCompleteButton from "./TodoCardCompleteButton";
import { HandCoins } from "lucide-react";

interface Props {
  charId: string;
  raidId: string;
  raid: Character["raids"][string];
  goldEarner: boolean;
}

export default function TodoCardRaid({
  charId,
  raidId,
  raid,
  goldEarner,
}: Props) {
  const actualraid = raids[raidId];

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
      className={cn(
        "flex flex-row justify-between items-center gap-2 p-3 transition",
        {
          "bg-primary/10": completedlen === raid.gates.length,
        },
      )}
    >
      <div className="flex flex-col grow min-w-0 items-start">
        <span className="">{actualraid.name}</span>
        <div className="flex flex-row gap-1">
          {goldEarner && <HandCoins className="size-4 stroke-yellow" />}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <p className="text-muted-foreground text-xs truncate">
                  {raid.gates
                    .map((g) => `${shortestDifficulty(g.difficulty)}`)
                    .join("")}
                </p>
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
      </div>
      <TodoCardCompleteButton
        assignedGates={raid.gates}
        charId={charId}
        raidId={raidId}
      />
    </div>
  );
}
