import CharacterEditCards from "@/components/EditCards";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Characters | Lost Ark Utils",
  description: "",
};

export default function CharactersPage() {
  return <CharacterEditCards />;
}
