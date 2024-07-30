import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Character } from "@/hooks/mainstore";
import { PencilIcon, PlusIcon } from "lucide-react";
import { Fragment } from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import CharacterCardAssignedRaid from "./CharacterAssignedRaid";
import CharacterCardInfo from "./CharacterCardInfo";
import { useAutoAnimate } from "@formkit/auto-animate/react";

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
      <CardHeader className="p-4 w-full h-full relative">
        <CharacterCardInfo char={char} />
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
