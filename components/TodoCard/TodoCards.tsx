"use client";

import { useMainStore } from "@/hooks/mainstore";
import { useMemo } from "react";
import TodoCard from "./TodoCard";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { TodoCardsNoCharactersCard } from "./TodoCardsNoCharactersCard";
import { _useMainStore } from "@/providers/MainStoreProvider";

export default function TodoCards() {
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
      className="mt-6 grid grid-cols-[auto_auto_auto_auto_auto_auto] gap-3 justify-center"
      ref={parent}
    >
      {charCards}
      {state.characters.length === 0 && <TodoCardsNoCharactersCard />}
    </main>
  );
}
