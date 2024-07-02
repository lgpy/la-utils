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
import { useMemo } from "react";

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
        <>
          <CardContent className="p-3">
            <CharacterCardAssignedRaid
              char={char}
              openRaidDialog={() => openRaidDialog(raidId)}
              raidId={raidId}
            />
          </CardContent>
          {i < keys.length - 1 && <Separator />}
        </>
      );
    });
  }, [char.raids]);

  return (
    <Card className="h-fit w-56">
      <CardHeader className="p-4">
        <CharacterCardInfo char={char} />
      </CardHeader>
      <Separator />
      {ar}
      {ar.length === 0 && <CardContent>No raids assigned</CardContent>}
    </Card>
  );
}
