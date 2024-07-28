"use client";

import CharacterTodoCard from "@/components/CharacterCard/CharacterTodoCard";
import FABActions from "@/components/FABActions";
import { useCharactersStore } from "@/providers/CharactersStoreProvider";
import { useMemo } from "react";

export default function Home() {
  const characters = useCharactersStore((store) => store);

  const charCards = useMemo(() => {
    return characters.characters.map((char) => (
      <CharacterTodoCard char={char} key={char.id} />
    ));
  }, [characters.characters]);

  return (
    <main className="mt-6 flex flex-row flex-wrap gap-3 justify-center">
      {charCards}
      <FABActions />
    </main>
  );
}
