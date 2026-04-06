"use client";

import { useMainStore, useSettingsStore } from "@/stores/main-store/provider";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import TodoCard from "./TodoCard";
import { TodoCardsNoCharactersCard } from "./TodoCardsNoCharactersCard";

export default function TodoCards() {
	const mainStore = useMainStore();
	const uiSettingsStore = useSettingsStore((store) => store);
	const [parent] = useAutoAnimate();

	if (!mainStore.hasHydrated || !uiSettingsStore.hasHydrated) {
		return null;
	}

	return (
		<>
			<main
				className="mt-6 grid xl:grid-cols-[auto_auto_auto_auto_auto_auto] md:grid-cols-[auto_auto_auto] sm:grid-cols-[auto_auto] gap-3 justify-center"
				ref={parent}
			>
				{mainStore.characters.map((char) =>
					char.isSpacer ? (
						<div className="w-56" key={char.id}></div>
					) : (
						<TodoCard char={char} key={char.id} />
					)
				)}
				{mainStore.characters.length === 0 && <TodoCardsNoCharactersCard />}
			</main>
		</>
	);
}
