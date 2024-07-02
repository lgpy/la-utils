import { hasReset } from "@/lib/dates";
import { Character } from "@/stores/character";
import clsx from "clsx";
import { Fragment, useMemo } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import CharacterCardInfo from "./CharacterCardInfo";
import { Separator } from "../ui/separator";
import { DateTime } from "luxon";
import TodoRaid from "./TodoRaid";

interface Props {
  char: Character;
}

export default function CharacterTodoCard({ char }: Props) {
  const raidBodies = useMemo(() => {
    return Object.keys(char.raids).map((raidId, i, keys) => {
      const assigned = char.raids[raidId].gates;
      const completed = assigned.filter((ag) => {
        if (!ag.completedDate) return false;

        return !hasReset(DateTime.fromISO(ag.completedDate));
      });

      const isCompleted = assigned.length === completed.length;

      return (
        <Fragment key={char.id + raidId}>
          <CardContent
            className={clsx("transition p-3", { "bg-primary/10": isCompleted })}
          >
            <TodoRaid char={char} raidId={raidId} />
          </CardContent>
          {i < keys.length - 1 && <Separator />}
        </Fragment>
      );
    });
  }, [char.raids]);

  return (
    <Card className="h-fit w-56">
      <CardHeader className="p-4">
        <CharacterCardInfo char={char} />
      </CardHeader>
      <Separator />
      {raidBodies}
      {raidBodies.length === 0 && <CardContent>No raids assigned</CardContent>}
    </Card>
  );
}
