"use client";

import CharacterEditCard from "@/components/CharacterCard/CharacterEditCard";
import CharacterEditCards from "@/components/CharacterEditCards";
import { useCharactersStore } from "@/providers/CharactersStoreProvider";
import { useMemo } from "react";

export default function CharactersPage() {
  return (
    <main className="mt-6 flex flex-row flex-wrap gap-3 justify-center">
      <CharacterEditCards />
    </main>
  );
}
