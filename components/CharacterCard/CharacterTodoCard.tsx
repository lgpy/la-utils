import { Character } from "@/hooks/mainstore";
import { cn } from "@/lib/utils";
import { Fragment } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Separator } from "../ui/separator";
import CharacterCardInfo from "./CharacterCardInfo";
import TodoRaid from "./TodoRaid";

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
      <CardHeader className="p-4">
        <CharacterCardInfo char={char} />
      </CardHeader>
      <Separator />
      {raids}
      {raids.length === 0 && (
        <CardContent className="p-3 text-center">No raids assigned</CardContent>
      )}
    </Card>
  );
}
