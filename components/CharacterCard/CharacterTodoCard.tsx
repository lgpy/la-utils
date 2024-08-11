import { Character } from "@/hooks/mainstore";
import { cn } from "@/lib/utils";
import { Fragment, useMemo } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Separator } from "../ui/separator";
import TodoRaid from "./TodoRaid";
import ClassIcon from "../class-icons/ClassIcon";
import { CoinsIcon, PiggyBank, SwordsIcon } from "lucide-react";
import { getGoldInfo } from "@/lib/chars";
import GoldEarningTooltip from "../GoldEarningTooltip";

interface Props {
  char: Character;
}

export default function CharacterTodoCard({ char }: Props) {
  const raids = Object.keys(char.raids).map((raidId, i, keys) => (
    <Fragment key={char.id + raidId}>
      <CardContent
        className={cn("transition p-0", {
          "rounded-b-lg": i === keys.length - 1,
        })}
      >
        <TodoRaid char={char} raidId={raidId} raid={char.raids[raidId]} />
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

        <GoldEarningTooltip char={char} />
      </CardHeader>
      <Separator />
      {raids}
      {raids.length === 0 && (
        <CardContent className="p-3 text-center">No raids assigned</CardContent>
      )}
    </Card>
  );
}
