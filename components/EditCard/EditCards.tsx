"use client";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Character, useMainStore } from "@/providers/MainStoreProvider";
import { dragAndDrop } from "@formkit/drag-and-drop/react";
import { isEqual } from "lodash";
import { LockIcon, LockOpenIcon, PlusIcon } from "lucide-react";
import { motion } from "motion/react";
import { type RefObject, useEffect, useRef, useState } from "react";
import EditCard from "./EditCard";
import EditCardCharacterDialog from "./EditCardCharacterDialog";
import EditCardRaidDialog from "./EditCardRaidDialog";
import EditCardTaskDialog from "./EditCardTaskDialog";
import EditCardsNoCharactersCard from "./EditCardsNoCharactersCard";

export default function EditCards() {
	const mainStore = useMainStore();
	const [isOpen, setIsOpen] = useState<false | "raid" | "char" | "task">(false);
	const [selectedCharacter, setSelectedCharacter] = useState<
		Character | undefined
	>(undefined);
	const [selectedRaid, setSelectedRaid] = useState<string | undefined>(
		undefined,
	);
	const [selectedTask, setSelectedTask] = useState<string | undefined>(
		undefined,
	);
	const [isLocked, setIsLocked] = useState(true);

	const openCharacterEditDialog = (char: Character | undefined) => {
		setSelectedCharacter(char);
		setIsOpen("char");
	};

	const openRaidDialog = (char: Character, raidId: string | undefined) => {
		setSelectedCharacter(char);
		setSelectedRaid(raidId);
		setIsOpen("raid");
	};

	const openTaskDialog = (char: Character, taskId: string | undefined) => {
		setSelectedCharacter(char);
		setSelectedTask(taskId);
		setIsOpen("task");
	};

	const parent = useRef(null) as RefObject<HTMLUListElement | null>;
	const [chars, setChars] = useState(mainStore.characters);
	const prevCharactersRef = useRef<Character[] | undefined>(undefined);

	dragAndDrop({
		parent: parent,
		state: [chars, setChars],
		dragHandle: ".mover",
		handleEnd(data) {
			const charId = data.targetData.node.data.value.id;
			const oldIndex = mainStore.characters.findIndex((c) => c.id === charId);
			if (oldIndex === -1) return;
			const newindex = data.targetData.node.data.index;
			//change character to new index state.charaters
			const newCharacters = [...mainStore.characters];
			newCharacters.splice(oldIndex, 1);
			newCharacters.splice(newindex, 0, mainStore.characters[oldIndex]);
			prevCharactersRef.current = structuredClone(newCharacters);
			mainStore.reorderChars(newCharacters.map((c) => c.id));
		},
	});

	useEffect(() => {
		if (!mainStore.hasHydrated) return;

		if (!isEqual(prevCharactersRef.current, mainStore.characters)) {
			setChars(structuredClone(mainStore.characters));
			prevCharactersRef.current = structuredClone(mainStore.characters);
		}
	}, [mainStore.characters, mainStore.hasHydrated, setChars]);

	if (!mainStore.hasHydrated) {
		return null;
	}

	return (
		<>
			<ul
				className="mt-6 grid xl:grid-cols-[auto_auto_auto_auto_auto_auto] md:grid-cols-[auto_auto_auto] sm:grid-cols-[auto_auto] gap-3 justify-center"
				ref={parent}
				data-pw="character-list"
			>
				{chars.map((char, index) => (
					<li data-label={char.id} key={char.id}>
						<EditCard
							char={char}
							editCharacter={() => openCharacterEditDialog(char)}
							openRaidDialog={(raidId) => openRaidDialog(char, raidId)}
							openTaskDialog={(taskId) => openTaskDialog(char, taskId)}
							movable={!isLocked}
							data-pw={`character-${index}`}
						/>
					</li>
				))}
				{chars.length === 0 && <EditCardsNoCharactersCard />}
			</ul>
			{isOpen === "char" && (
				<EditCardCharacterDialog
					isOpen={isOpen === "char"}
					close={() => setIsOpen(false)}
					existingCharacter={selectedCharacter}
				/>
			)}
			{selectedCharacter && isOpen === "raid" && (
				<EditCardRaidDialog
					character={selectedCharacter}
					isOpen={isOpen === "raid"}
					raidId={selectedRaid}
					close={() => setIsOpen(false)}
				/>
			)}
			{selectedCharacter && isOpen === "task" && (
				<EditCardTaskDialog
					character={selectedCharacter}
					isOpen={isOpen === "task"}
					close={() => setIsOpen(false)}
					taskId={selectedTask}
				/>
			)}
			<motion.div
				className="fixed right-4 bottom-4"
				initial={{ scale: 0.8, opacity: 0 }}
				animate={{
					scale: 1,
					opacity: 1,
					transition: {
						type: "spring",
						stiffness: 260,
						damping: 20,
					},
				}}
			>
				<div className="flex flex-col gap-2">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="secondary"
									size="icon"
									onClick={() => setIsLocked(!isLocked)}
									aria-label="Lock/Unlock Characters"
								>
									{isLocked ? (
										<LockIcon className="size-6" />
									) : (
										<LockOpenIcon className="size-6" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent side="left">
								<p>Lock/Unlock Characters</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<Button
						variant="default"
						size="icon"
						onClick={() => openCharacterEditDialog(undefined)}
						data-pw={"create-character"}
					>
						<PlusIcon className="size-6" />
					</Button>
				</div>
			</motion.div>
		</>
	);
}
