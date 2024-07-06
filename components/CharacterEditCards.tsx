import { useMemo, useState } from "react";
import CharacterFormDialog from "./CharacterFormDialog";
import CharacterEditCard from "./CharacterCard/CharacterEditCard";
import { useCharactersStore } from "@/providers/CharactersStoreProvider";
import { Character } from "@/stores/character";
import { Button } from "./ui/button";
import { ChevronRight, PlusIcon } from "lucide-react";

export default function CharacterEditCards() {
  const characters = useCharactersStore((store) => store);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<
    Character | undefined
  >(undefined);

  const openCharacterEditDialog = (char: Character | undefined) => {
    setSelectedCharacter(char);
    setIsOpen(true);
  };

  const charCards = useMemo(() => {
    return characters.characters.map((char) => (
      <CharacterEditCard
        char={char}
        editCharacter={() => openCharacterEditDialog(char)}
        openRaidDialog={() => null}
        key={char.id}
      />
    ));
  }, [characters.characters]);

  return (
    <>
      {charCards}
      <CharacterFormDialog
        isOpen={isOpen}
        close={() => setIsOpen(false)}
        existingCharacter={selectedCharacter}
      />
      <Button
        className="absolute right-4 bottom-4"
        variant="default"
        size="icon"
        onClick={() => openCharacterEditDialog(undefined)}
      >
        <PlusIcon className="h-6 w-6" />
      </Button>
    </>
  );
}
