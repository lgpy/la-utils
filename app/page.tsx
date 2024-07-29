import CharacterTodoCards from "@/components/CharacterTodoCards";
import FABActions from "@/components/FABActions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | Lost Ark Utils",
  description: "",
};

export default function Home() {
  return (
    <main className="mt-6 flex flex-row flex-wrap gap-3 justify-center">
      <CharacterTodoCards />
      <FABActions />
    </main>
  );
}
