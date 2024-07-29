import CharacterEditCards from "@/components/CharacterEditCards";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Characters | Lost Ark Utils",
  description: "",
};

export default function CharactersPage() {
  return (
    <main className="mt-6 flex flex-row flex-wrap gap-3 justify-center">
      <CharacterEditCards />
    </main>
  );
}
