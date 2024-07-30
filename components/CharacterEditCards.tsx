"use client";

import { useMemo, useState } from "react";
import CharacterFormDialog from "./CharacterFormDialog";
import CharacterEditCard from "./CharacterCard/CharacterEditCard";
import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";
import CharacterRaidDialog from "./CharacterRaidDialog";
import { Character, useMainStore } from "@/hooks/mainstore";
import { motion } from "framer-motion";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import CharacterPageNoCharactersCard from "./CharacterPageNoCharactersCard";

export default function CharacterEditCards() {
  const mainStore = useMainStore();
  const [isOpen, setIsOpen] = useState<false | "raid" | "char">(false);
  const [selectedCharacter, setSelectedCharacter] = useState<
    Character | undefined
  >(undefined);
  const [selectedRaid, setSelectedRaid] = useState<string | undefined>(
    undefined,
  );
  const [parent] = useAutoAnimate();

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
      <main
        className="mt-6 flex flex-row flex-wrap gap-3 justify-center"
        ref={parent}
      >
        {charCards}
        {charCards.length === 0 && <CharacterPageNoCharactersCard />}
      </main>
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
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 260,
            damping: 20,
          },
        }}
        className="fixed right-4 bottom-4"
      >
        <Button
          variant="default"
          size="icon"
          onClick={() => openCharacterEditDialog(undefined)}
        >
          <PlusIcon className="h-6 w-6" />
        </Button>
      </motion.div>
    </>
  );
}
