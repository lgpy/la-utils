import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CharacterCardInfo from "./CharacterCardInfo";
import { Character } from "@/stores/character";
import { Separator } from "../ui/separator";
import CharacterCardAssignedRaid from "./CharacterAssignedRaid";
import { Fragment, useMemo } from "react";
import { ChevronRight, PencilIcon, PlusIcon } from "lucide-react";
import { Button } from "../ui/button";

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
  const ar = useMemo(() => {
    return Object.keys(char.raids).map((raidId, i, keys) => {
      return (
        <Fragment key={char.id + raidId}>
          <CardContent className="p-3">
            <CharacterCardAssignedRaid
              char={char}
              openRaidDialog={() => openRaidDialog(raidId)}
              raidId={raidId}
            />
          </CardContent>
          {i < keys.length - 1 && <Separator />}
        </Fragment>
      );
    });
  }, [char.raids]);

  return (
    <Card className="h-fit w-56">
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
      {ar}
      <Separator />
      <CardContent className="p-0">
        <Button
          className="w-full rounded-t-none"
          onClick={() => openRaidDialog()}
        >
          <PlusIcon className="mr-2 h-4 w-4" /> Add raid
        </Button>
      </CardContent>
    </Card>
  );
}
