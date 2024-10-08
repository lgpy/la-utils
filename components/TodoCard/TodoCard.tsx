import { Character } from "@/hooks/mainstore";
import { getHighest3, parseGoldInfo } from "@/lib/chars";
import { cn } from "@/lib/utils";
import { SwordsIcon } from "lucide-react";
import { Fragment, useMemo } from "react";
import ClassIcon from "@/components/class-icons/ClassIcon";
import PiggyBank from "@/components/PiggyBank";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import TodoCardRaid from "./TodoCardRaid";

interface Props {
  char: Character;
  isGoldEarner: boolean;
}

export default function TodoCard({ char, isGoldEarner }: Props) {
  const highest3 = useMemo(() => {
    const goldInfo = parseGoldInfo(char.assignedRaids);
    const highest3 = getHighest3(goldInfo);
    return highest3;
  }, [char]);

  const raids = Object.keys(char.assignedRaids).map((raidId, i, keys) => (
    <Fragment key={char.id + raidId}>
      <CardContent
        className={cn("transition p-0", {
          "rounded-b-lg": i === keys.length - 1,
        })}
      >
        <TodoCardRaid
          charId={char.id}
          raidId={raidId}
          raid={char.assignedRaids[raidId]}
          goldEarner={
            isGoldEarner &&
            highest3[raidId] !== undefined &&
            Object.keys(highest3).length <
              Object.keys(char.assignedRaids).length
          }
        />
      </CardContent>
      {i < keys.length - 1 && <Separator className="opacity-75" />}
    </Fragment>
  ));

  return (
    <Card className="h-fit w-56 border-card border-1 select-none">
      <CardHeader className="p-4 flex flex-row gap-2 items-center relative">
        <ClassIcon c={char.class} className="size-10 min-w-10" />
        <div className="flex flex-col w-full">
          <span className="text-xs text-default-500 text-muted-foreground">
            {char.class}
          </span>
          <h2 className="font-bold">{char.name}</h2>
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-semibold text-yellow",
            )}
          >
            <SwordsIcon className="size-5 mr-1" />
            {char.itemLevel}
          </div>
        </div>

        {isGoldEarner && <PiggyBank goldInfo={highest3} />}
      </CardHeader>
      <Separator />
      {raids}
      {raids.length === 0 && (
        <CardContent className="p-3 text-center">No raids assigned</CardContent>
      )}
    </Card>
  );
}
