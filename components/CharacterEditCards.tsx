"use client";

import { useMemo, useState } from "react";
import CharacterFormDialog from "./CharacterFormDialog";
import CharacterEditCard from "./CharacterCard/CharacterEditCard";
import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";
import CharacterRaidDialog from "./CharacterRaidDialog";
import { Character, useMainStore } from "@/hooks/mainstore";

export default function CharacterEditCards() {
  const mainStore = useMainStore();
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
    return mainStore.characters.map((char) => (
      <CharacterEditCard
        char={char}
        editCharacter={() => openCharacterEditDialog(char)}
        openRaidDialog={(raidId) => openRaidDialog(char, raidId)}
        key={char.id}
      />
    ));
  }, [mainStore.characters]);

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
