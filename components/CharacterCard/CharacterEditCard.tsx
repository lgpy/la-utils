import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Character } from "@/hooks/mainstore";
import { PencilIcon, PlusIcon, SwordsIcon } from "lucide-react";
import { Fragment } from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import CharacterCardAssignedRaid from "./CharacterAssignedRaid";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import ClassIcon from "../class-icons/ClassIcon";
import { cn } from "@/lib/utils";

interface Props {
  char: Character;
  editCharacter: () => void;
  openRaidDialog: (raidId?: string) => void;
}

export default function CharacterEditCard({
  char,
  editCharacter,
  openRaidDialog,
}: Props) {
  const [parent] = useAutoAnimate();

  const ar = Object.keys(char.raids).map((raidId, i, keys) => (
    <Fragment key={char.id + raidId}>
      <CardContent className="p-3">
        <CharacterCardAssignedRaid
          char={char}
          openRaidDialog={() => openRaidDialog(raidId)}
          raidId={raidId}
        />
      </CardContent>
      {i < keys.length - 1 && <Separator className="opacity-75" />}
    </Fragment>
  ));

  return (
    <Card className="h-fit w-56 border-card border-1">
      <CardHeader className="p-4 flex flex-row gap-2 items-center relative">
        <ClassIcon c={char.class} className="size-10" />
        <div className="flex flex-col">
          <span className="text-xs text-default-500 text-muted-foreground">
            {char.class}
          </span>
          <h2 className="font-bold">{char.name}</h2>
          <div
            className={cn(
              "flex items-center text-sm font-semibold dark:text-[#eed49f] text-[#df8e1d]",
            )}
          >
            <SwordsIcon className="size-5 mr-1" />
            {char.itemLevel}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 !m-0"
          onClick={() => editCharacter()}
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
      </CardHeader>
      <Separator />
      <div ref={parent}>{ar}</div>
      <Separator />
      <CardContent className="p-0">
        <Button
          className="w-full rounded-t-none"
          onClick={() => openRaidDialog()}
          variant="ghost"
        >
          <PlusIcon className="mr-2 h-4 w-4" /> Add raid
        </Button>
      </CardContent>
    </Card>
  );
}
