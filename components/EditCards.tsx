"use client";

import { Character, useMainStore } from "@/hooks/mainstore";
import { dragAndDrop } from "@formkit/drag-and-drop/react";
import { motion } from "framer-motion";
import { isEqual } from "lodash";
import { LockIcon, LockOpenIcon, PlusIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import EditCard from "./EditCard";
import CharacterFormDialog from "./CharacterFormDialog";
import CharacterPageNoCharactersCard from "./CharacterPageNoCharactersCard";
import CharacterRaidDialog from "./CharacterRaidDialog";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export default function CharacterEditCards() {
  const { state, hasHydrated } = useMainStore();
  const [isOpen, setIsOpen] = useState<false | "raid" | "char">(false);
  const [selectedCharacter, setSelectedCharacter] = useState<
    Character | undefined
  >(undefined);
  const [selectedRaid, setSelectedRaid] = useState<string | undefined>(
    undefined,
  );
  const [isLocked, setIsLocked] = useState(true);

  const openCharacterEditDialog = (char: Character | undefined) => {
    setSelectedCharacter(char);
    setIsOpen("char");
  };

  const openRaidDialog = (char: Character, raidId: string | undefined) => {
    setSelectedCharacter(char);
    setSelectedRaid(raidId);
    setIsOpen("raid");
  };

  const parent = useRef() as React.MutableRefObject<HTMLUListElement>;
  const [chars, setChars] = useState(state.characters);
  const prevCharactersRef = useRef<Character[] | undefined>(undefined);

  dragAndDrop({
    parent: parent,
    state: [chars, setChars],
    dragHandle: ".mover",
    handleEnd(data) {
      const charId = data.targetData.node.data.value.id;
      const oldIndex = state.characters.findIndex((c) => c.id === charId);
      if (oldIndex === -1) return;
      const newindex = data.targetData.node.data.index;
      //change character to new index state.charaters
      const newCharacters = [...state.characters];
      newCharacters.splice(oldIndex, 1);
      newCharacters.splice(newindex, 0, state.characters[oldIndex]);
      prevCharactersRef.current = structuredClone(newCharacters);
      state.reorderChars(newCharacters.map((c) => c.id));
    },
  });

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isEqual(prevCharactersRef.current, state.characters)) {
      setChars(structuredClone(state.characters));
      prevCharactersRef.current = structuredClone(state.characters);
    }
  }, [state.characters, hasHydrated, setChars]);

  if (!hasHydrated) {
    return null;
  }

  return (
    <>
      <ul
        className="mt-6 flex flex-row flex-wrap gap-3 justify-center"
        ref={parent}
        data-pw="character-list"
      >
        {chars.map((char, index) => (
          <li data-label={char.id} key={char.id}>
            <EditCard
              char={char}
              editCharacter={() => openCharacterEditDialog(char)}
              openRaidDialog={(raidId) => openRaidDialog(char, raidId)}
              movable={!isLocked}
              data-pw={`character-${index}`}
            />
          </li>
        ))}
        {chars.length === 0 && <CharacterPageNoCharactersCard />}
      </ul>
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
        <div className="flex flex-col gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setIsLocked(!isLocked)}
                  aria-label="Lock/Unlock Characters"
                >
                  {isLocked ? (
                    <LockIcon className="h-6 w-6" />
                  ) : (
                    <LockOpenIcon className="h-6 w-6" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Lock/Unlock Characters</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="default"
            size="icon"
            onClick={() => openCharacterEditDialog(undefined)}
            data-pw={`create-character`}
          >
            <PlusIcon className="h-6 w-6" />
          </Button>
        </div>
      </motion.div>
    </>
  );
}
