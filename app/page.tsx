import CharacterTodoCards from "@/components/CharacterTodoCards";
import FABActions from "@/components/FABActions";
import RosterGold from "@/components/RosterGold";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | Lost Ark Utils",
  description: "",
};

export default function Home() {
  return (
    <>
      <CharacterTodoCards />
      <FABActions />
      <RosterGold />
    </>
  );
}
