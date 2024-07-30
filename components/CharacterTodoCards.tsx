"use client";

import { useMainStore } from "@/hooks/mainstore";
import { useMemo } from "react";
import CharacterTodoCard from "./CharacterCard/CharacterTodoCard";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { NoCharactersCard } from "./NoCharactersCard";

export default function CharacterTodoCards() {
  const { hasHydrated, state } = useMainStore();
  const [parent] = useAutoAnimate();

  const charCards = useMemo(() => {
    return state.characters.map((char) => (
      <CharacterTodoCard char={char} key={char.id} />
    ));
  }, [state.characters]);

  if (!hasHydrated) {
    return null;
  }

  return (
    <main
      className="mt-6 flex flex-row flex-wrap gap-3 justify-center"
      ref={parent}
    >
      {charCards}
      {state.characters.length === 0 && <NoCharactersCard />}
    </main>
  );
}
