"use client";

import CharacterEditCard from "@/components/CharacterCard/CharacterEditCard";
import { useCharactersStore } from "@/providers/CharactersStoreProvider";
import { useMemo } from "react";

export default function CharactersPage() {
  const characters = useCharactersStore((store) => store);

  const charCards = useMemo(() => {
    return characters.characters.map((char) => (
      <CharacterEditCard
        char={char}
        editCharacter={() => null}
        openRaidDialog={() => null}
        key={char.id}
      />
    ));
  }, [characters.characters]);

  return (
    <main className="mt-6 flex flex-row flex-wrap gap-3 justify-center">
      {charCards}
    </main>
  );
}
