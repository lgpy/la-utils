"use client";

import { useMainStore } from "@/hooks/mainstore";
import { useMemo } from "react";
import CharacterTodoCard from "./CharacterCard/CharacterTodoCard";

export default function CharacterTodoCards() {
  const characters = useMainStore();

  const charCards = useMemo(() => {
    return characters.characters.map((char) => (
      <CharacterTodoCard char={char} key={char.id} />
    ));
  }, [characters.characters]);

  return charCards;
}
