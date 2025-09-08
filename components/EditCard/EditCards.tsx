"use client";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Character, useMainStore } from "@/stores/main-store/provider";
import { dragAndDrop } from "@formkit/drag-and-drop/react";
import { isEqual } from "lodash";
import { LockIcon, LockOpenIcon, PlusIcon } from "lucide-react";
import { motion } from "motion/react";
import { type RefObject, useEffect, useRef, useState } from "react";
import EditCard from "./EditCard";
import EditCardCharacterDialog from "./EditCardCharacterDialog";
import EditCardRaidDialog from "./EditCardRaidDialog";
import EditCardTaskManagementDialog from "./EditCardTaskManagementDialog";
import EditCardsNoCharactersCard from "./EditCardsNoCharactersCard";
import EditCardTaskDialog from "./EditCardTaskDialog";

type DialogState = {
	type: "none" | "char" | "raid" | "taskManagement" | "taskEditing";
	character: Character | undefined;
	raidId: string | undefined;
	taskId: string | undefined;
};

export default function EditCards() {
	const mainStore = useMainStore();
	const [dialogState, setDialogState] = useState<DialogState>({
		type: "none",
		character: undefined,
		raidId: undefined,
		taskId: undefined,
	});
	const [isLocked, setIsLocked] = useState(true);

	const openCharacterEditDialog = (char?: Character) => {
		setDialogState((prev) => ({
			...prev,
			type: "char",
			character: char ? char : undefined,
		}));
	};

	const openRaidDialog = (char: Character, raidId?: string) => {
		setDialogState((prev) => ({
			...prev,
			type: "raid",
			character: char,
			raidId: raidId ? raidId : undefined,
		}));
	};

	const openTaskDialog = (char: Character) => {
		setDialogState((prev) => ({
			...prev,
			type: "taskManagement",
			character: char,
		}));
	};

	const openTaskEditingDialog = (character: Character, taskId?: string) => {
		setDialogState((prev) => ({
			...prev,
			type: "taskEditing",
			character,
			taskId: taskId ? taskId : undefined,
		}));
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
							openTaskDialog={() => openTaskDialog(char)}
							movable={!isLocked}
							data-pw={`character-${index}`}
						/>
					</li>
				))}
				{chars.length === 0 && <EditCardsNoCharactersCard />}
			</ul>
			<EditCardCharacterDialog
				isOpen={dialogState.type === "char"}
				close={() => setDialogState((prev) => ({ ...prev, type: "none" }))}
				existingCharacter={dialogState.character}
			/>
			{dialogState.character !== undefined && (
				<EditCardRaidDialog
					character={dialogState.character}
					isOpen={dialogState.type === "raid"}
					raidId={dialogState.raidId}
					close={() => setDialogState((prev) => ({ ...prev, type: "none" }))}
				/>
			)}
			{dialogState.character !== undefined && (
				<EditCardTaskManagementDialog
					character={dialogState.character}
					isOpen={dialogState.type === "taskManagement"}
					close={() => setDialogState((prev) => ({ ...prev, type: "none" }))}
					openTaskDialog={(taskID: string | undefined) =>
						dialogState.character &&
						openTaskEditingDialog(dialogState.character, taskID)
					}
				/>
			)}
			<EditCardTaskDialog
				taskId={dialogState.taskId}
				isOpen={dialogState.type === "taskEditing"}
				close={() => {
					const newCharData = mainStore.characters.find(
						(c) => c.id === dialogState.character?.id
					);
					if (newCharData) {
						setDialogState((prev) => ({
							...prev,
							type: "taskManagement",
							character: newCharData,
						}));
					} else {
						setDialogState((prev) => ({ ...prev, type: "none" }));
					}
				}}
			/>
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
