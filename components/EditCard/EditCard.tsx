import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Character } from "@/hooks/mainstore";
import { cn } from "@/lib/utils";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { MoveIcon, PencilIcon, PlusIcon, SwordsIcon } from "lucide-react";
import { Fragment } from "react";
import ClassIcon from "@/components/class-icons/ClassIcon";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CharacterCardAssignedRaid from "./EditCardAssignedRaid";
import { sortRaidKeys } from "@/lib/chars";

type Props = {
  char: Character;
  editCharacter: () => void;
  openRaidDialog: (raidId?: string) => void;
  movable?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export default function EditCard(props: Props) {
  const [parent] = useAutoAnimate();
  const {
    char,
    editCharacter,
    openRaidDialog,
    movable = false,
    ...divProps
  } = props;

  const ar = Object.keys(char.assignedRaids)
    .sort(sortRaidKeys)
    .map((raidId, i, keys) => (
      <Fragment key={char.id + raidId}>
        <CardContent data-pw={`character-assigned-raid-${i}`} className="p-0">
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
    <Card className="h-fit w-56 border-card border-1" {...divProps}>
      <CardHeader className="p-4 flex flex-row gap-2 items-center relative">
        <ClassIcon c={char.class} className="size-10" />
        <div className="flex flex-col">
          <span
            className="text-xs text-default-500 text-muted-foreground"
            data-pw="character-class"
          >
            {char.class}
          </span>
          <h2 className="font-bold" data-pw="character-name">
            {char.name}
          </h2>
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-semibold dark:text-[#eed49f] text-[#df8e1d]",
            )}
            data-pw="character-item-level"
          >
            <SwordsIcon className="size-5" />
            {char.itemLevel}
          </div>
        </div>
        {movable && (
          <MoveIcon className="mover size-4 absolute top-1 mx-auto right-0 left-0 !mt-0 cursor-move" />
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 !m-0"
          onClick={() => editCharacter()}
          data-pw={`edit-character`}
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
          data-pw={`character-add-raid`}
        >
          <PlusIcon className="mr-2 h-4 w-4" /> Add raid
        </Button>
      </CardContent>
    </Card>
  );
}
