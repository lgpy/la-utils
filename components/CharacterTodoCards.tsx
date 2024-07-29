"use client";

import { useMainStore } from "@/hooks/mainstore";
import { useMemo } from "react";
import CharacterTodoCard from "./CharacterCard/CharacterTodoCard";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export default function CharacterTodoCards() {
  const characters = useMainStore();
  const [parent] = useAutoAnimate();

  const charCards = useMemo(() => {
    return characters.characters.map((char) => (
      <CharacterTodoCard char={char} key={char.id} />
    ));
  }, [characters.characters]);

  return (
    <main
      className="mt-6 flex flex-row flex-wrap gap-3 justify-center"
      ref={parent}
    >
      {charCards}
    </main>
  );
}
