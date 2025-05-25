import { Character, useSettingsStore } from "@/providers/MainStoreProvider";
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
  const settingsStore = useSettingsStore();
  const actualraid = raids[raidId];

  if (!actualraid) {
    console.error(`Raid ${raidId} not found`);
    return null;
  }

  if (!settingsStore.hasHydrated) {
    return null;
  }

  const completedRaids = Object.values(raid).reduce(
    (acc, ag) => (ag.completed ? acc + 1 : acc),
    0,
  );

  const progress = completedRaids / Object.keys(raid).length;

  const isCompactCardEnabled = settingsStore.experiments.compactRaidCard;

  return (
    <div
      className={cn(
        "relative flex flex-row items-center justify-between gap-2 p-3 transition",
        {
          "p-1 px-3": isCompactCardEnabled,
        },
      )}
    >
      <motion.div
        className="absolute left-0 right-0 top-0 z-0 h-full bg-primary/10"
        initial={false}
        animate={{
          width: `${progress * 100}%`,
        }}
        transition={{
          duration: 0.4,
        }}
      ></motion.div>

      {goldEarner && (
        <HandCoins
          className={cn(
            "transition-opacity size-4 stroke-yellow absolute right-0.5 bottom-0.5 opacity-80",
            {
              "opacity-40": completedRaids === Object.keys(raid).length,
              "right-[1px] bottom-[1px]": isCompactCardEnabled,
            },
          )}
        />
      )}
      <div className="z-10 flex flex-col grow min-w-0 items-start gap-1.5">
        <p
          className={cn("transition-all", {
            "opacity-80": completedRaids === Object.keys(raid).length,
          })}
        >
          {actualraid.name}
        </p>
        {!isCompactCardEnabled && (
          <div className="flex flex-row gap-1">
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
                        ([gid, g]) =>
                          `${gid} ${shortenDifficulty(g.difficulty)}`,
                      )
                      .join(", ")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
      <div className="z-10 flex flex-row items-center justify-end">
        <TodoCardCompleteButtonV2
          assignedGates={raid}
          charId={charId}
          raidId={raidId}
        />
      </div>
    </div>
  );
}
