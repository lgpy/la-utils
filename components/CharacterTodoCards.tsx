"use client";

import { useMainStore } from "@/hooks/mainstore";
import { useMemo } from "react";
import TodoCard from "./TodoCard";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { NoCharactersCard } from "./NoCharactersCard";
import { _useMainStore } from "@/providers/MainStoreProvider";

export default function CharacterTodoCards() {
  const { hasHydrated, state } = useMainStore();
  const [parent] = useAutoAnimate();

  const charCards = useMemo(() => {
    return state.characters.map((char, idx) => (
      <TodoCard char={char} key={char.id} isGoldEarner={idx < 6} />
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
