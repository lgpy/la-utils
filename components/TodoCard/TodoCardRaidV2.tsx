import { Character } from "@/hooks/mainstore";
import { raids, shortenDifficulty, shortestDifficulty } from "@/lib/raids";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HandCoins } from "lucide-react";
import TodoCardCompleteButtonV2 from "./TodoCardCompleteButtonV2";
import { motion } from "framer-motion";

interface Props {
  charId: string;
  raidId: string;
  raid: Character["assignedRaids"][string];
  goldEarner: boolean;
}

export default function TodoCardRaidV2({
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

  const completedRaids = Object.values(raid).reduce(
    (acc, ag) => (ag.completed ? acc + 1 : acc),
    0,
  );

  const progress = completedRaids / Object.keys(raid).length;

  return (
    <div
      className={cn(
        "relative flex flex-row items-center justify-between gap-2 p-3 transition",
      )}
    >
      <motion.div
        className="absolute left-0 right-0 top-0 z-0 h-full bg-mauve/10"
        initial={false}
        animate={{
          width: `${progress * 100}%`,
        }}
      ></motion.div>
      <div className="z-10 flex flex-col grow min-w-0 items-start gap-1.5">
        <p>{actualraid.name}</p>
        <div className="flex flex-row gap-1">
          {goldEarner && <HandCoins className="size-4 stroke-yellow" />}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <p className="text-muted-foreground text-xs truncate">
                  {Object.values(raid)
                    .map((g) => `${shortestDifficulty(g.difficulty)}`)
                    .join("")}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {Object.entries(raid)
                    .map(
                      ([gid, g]) => `${gid} ${shortenDifficulty(g.difficulty)}`,
                    )
                    .join(", ")}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="z-10 flex flex-row items-center justify-end gap-1">
        <TodoCardCompleteButtonV2
          assignedGates={raid}
          charId={charId}
          raidId={raidId}
        />
      </div>
    </div>
  );
}
