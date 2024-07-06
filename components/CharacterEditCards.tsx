import { useMemo, useState } from "react";
import CharacterFormDialog from "./CharacterFormDialog";
import CharacterEditCard from "./CharacterCard/CharacterEditCard";
import { useCharactersStore } from "@/providers/CharactersStoreProvider";
import { Character } from "@/stores/character";
import { Button } from "./ui/button";
import { ChevronRight, PlusIcon } from "lucide-react";
import CharacterRaidDialog from "./CharacterRaidDialog";
import { set } from "react-hook-form";

export default function CharacterEditCards() {
  const characters = useCharactersStore((store) => store);
  const [isOpen, setIsOpen] = useState<false | "raid" | "char">(false);
  const [selectedCharacter, setSelectedCharacter] = useState<
    Character | undefined
  >(undefined);
  const [selectedRaid, setSelectedRaid] = useState<string | undefined>(
    undefined,
  );

  const openCharacterEditDialog = (char: Character | undefined) => {
    setSelectedCharacter(char);
    setIsOpen("char");
  };

  const openRaidDialog = (char: Character, raidId: string | undefined) => {
    setSelectedCharacter(char);
    setSelectedRaid(raidId);
    setIsOpen("raid");
  };

  const charCards = useMemo(() => {
    return characters.characters.map((char) => (
      <CharacterEditCard
        char={char}
        editCharacter={() => openCharacterEditDialog(char)}
        openRaidDialog={(raidId) => openRaidDialog(char, raidId)}
        key={char.id}
      />
    ));
  }, [characters.characters]);

  return (
    <>
      {charCards}
      {isOpen === "char" && (
        <CharacterFormDialog
          isOpen={isOpen === "char"}
          close={() => setIsOpen(false)}
          existingCharacter={selectedCharacter}
        />
      )}
      {selectedCharacter && isOpen === "raid" && (
        <CharacterRaidDialog
          character={selectedCharacter}
          isOpen={isOpen === "raid"}
          raidId={selectedRaid}
          close={() => setIsOpen(false)}
        />
      )}
      <Button
        className="right-4 bottom-4 fixed"
        variant="default"
        size="icon"
        onClick={() => openCharacterEditDialog(undefined)}
      >
        <PlusIcon className="h-6 w-6" />
      </Button>
    </>
  );
}
