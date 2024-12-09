"use client";

import { useMainStore } from "@/providers/MainStoreProvider";
import { useMemo } from "react";
import TodoCard from "./TodoCard";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { TodoCardsNoCharactersCard } from "./TodoCardsNoCharactersCard";

export default function TodoCards() {
  const mainStore = useMainStore();
  const [parent] = useAutoAnimate();

  const charCards = useMemo(() => {
    return mainStore.characters.map((char) => (
      <TodoCard char={char} key={char.id} />
    ));
  }, [mainStore.characters]);

  if (!mainStore.hasHydrated) {
    return null;
  }

  return (
    <main
      className="mt-6 grid xl:grid-cols-[auto_auto_auto_auto_auto_auto] md:grid-cols-[auto_auto_auto] sm:grid-cols-[auto_auto] gap-3 justify-center"
      ref={parent}
    >
      {charCards}
      {mainStore.characters.length === 0 && <TodoCardsNoCharactersCard />}
    </main>
  );
}
