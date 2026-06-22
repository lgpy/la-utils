"use client";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Character, useMainStore } from "@/stores/main-store/provider";
import { LockIcon, LockOpenIcon, PlusIcon } from "lucide-react";
import { useRef, useState } from "react";
import EditCard from "./EditCard";
import EditCardCharacterDialog from "./EditCardCharacterDialog";
import EditCardRaidDialog from "./EditCardRaidDialog";
import EditCardTaskManagementDialog from "./EditCardTaskManagementDialog";
import EditCardsNoCharactersCard from "./EditCardsNoCharactersCard";
import EditCardTaskDialog from "./EditCardTaskDialog";
import EditCardSpacer from "./EditCardSpacer";
import { showAlert } from "../AlertDialog.hooks";
import { toast } from "sonner";
import { ExpandableButton } from "../ExpandableButton";
import { FabButtonWrapper } from "../FABs/FabButtonWrapper";
import { DragDropProvider } from "@dnd-kit/react";

type DialogState = {
	type: "none" | "char" | "raid" | "taskManagement" | "taskEditing";
	character: Character | undefined;
	raidId: string | undefined;
	taskId: string | undefined;
};

import { isSortable, useSortable } from "@dnd-kit/react/sortable";

function SortableCharCard({
	char,
	index,
	deleteCharacter,
	openCharacterEditDialog,
	openRaidDialog,
	openTaskDialog,
	isLocked,
}: {
	char: Character;
	index: number;
	deleteCharacter: (charId: string) => void;
	openCharacterEditDialog: (char?: Character) => void;
	openRaidDialog: (char: Character, raidId?: string) => void;
	openTaskDialog: (char: Character) => void;
	isLocked: boolean;
}) {
	const [element, setElement] = useState<Element | null>(null);
	const handleRef = useRef<SVGSVGElement | null>(null);
	const { isDragging } = useSortable({
		id: char.id,
		index,
		element,
		handle: handleRef,
		disabled: isLocked,
	});

	return (
		<li ref={setElement}>
			{char.isSpacer ? (
				<EditCardSpacer
					char={char}
					deleteCharacter={() => deleteCharacter(char.id)}
					drag={{
						disabled: isLocked,
						moveRef: handleRef,
						isDragging,
					}}
				/>
			) : (
				<EditCard
					char={char}
					editCharacter={() => openCharacterEditDialog(char)}
					openRaidDialog={(raidId) => openRaidDialog(char, raidId)}
					openTaskDialog={() => openTaskDialog(char)}
					data-pw={`character-${index}`}
					drag={{
						disabled: isLocked,
						moveRef: handleRef,
						isDragging,
					}}
				/>
			)}
		</li>
	);
}

export default function EditCards() {
	const mainStore = useMainStore();
	const [dialogState, setDialogState] = useState<DialogState>({
		type: "none",
		character: undefined,
		raidId: undefined,
		taskId: undefined,
	});
	const [isLocked, setIsLocked] = useState(true);

	const openCharacterEditDialog = (char?: Character) =>
		setDialogState((prev) => ({
			...prev,
			type: "char",
			character: char ? char : undefined,
		}));

	const openRaidDialog = (char: Character, raidId?: string) =>
		setDialogState((prev) => ({
			...prev,
			type: "raid",
			character: char,
			raidId: raidId ? raidId : undefined,
		}));

	const openTaskDialog = (char: Character) =>
		setDialogState((prev) => ({
			...prev,
			type: "taskManagement",
			character: char,
		}));

	const openTaskEditingDialog = (character: Character, taskId?: string) =>
		setDialogState((prev) => ({
			...prev,
			type: "taskEditing",
			character,
			taskId: taskId ? taskId : undefined,
		}));

	if (!mainStore.hasHydrated) {
		return null;
	}

	async function deleteCharacter(charId: string) {
		const decision = await showAlert({
			title: "Delete Character",
			description:
				"Are you sure you want to delete this character? This action cannot be undone.",
			cancelButton: {
				text: "Cancel",
			},
			confirmButton: {
				text: "Delete",
			},
		});
		if (!decision) return;
		mainStore.deleteCharacter(charId);
		toast.success("Character deleted successfully!");
	}

	return (
		<>
			<DragDropProvider
				onDragEnd={(event) => {
					if (event.canceled) return;
					const { source } = event.operation;

					if (!isSortable(source)) return;

					const { initialIndex, index } = source;

					if (initialIndex == index) return;

					const newcharIds = mainStore.characters.map((c) => c.id);
					const [removed] = newcharIds.splice(initialIndex, 1);
					newcharIds.splice(index, 0, removed);
					mainStore.reorderChars(newcharIds);
				}}
			>
				<ul
					className="mt-6 grid xl:grid-cols-[auto_auto_auto_auto_auto_auto] md:grid-cols-[auto_auto_auto] sm:grid-cols-[auto_auto] gap-3 justify-center"
					data-pw="character-list"
				>
					{mainStore.characters.map((char, index) => (
						<SortableCharCard
							key={char.id}
							char={char}
							index={index}
							deleteCharacter={deleteCharacter}
							openCharacterEditDialog={openCharacterEditDialog}
							openRaidDialog={openRaidDialog}
							openTaskDialog={openTaskDialog}
							isLocked={isLocked}
						/>
					))}
					{mainStore.characters.length === 0 && <EditCardsNoCharactersCard />}
				</ul>
			</DragDropProvider>
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

			<div className="fixed right-4 bottom-4 flex flex-col gap-2 items-end">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<FabButtonWrapper>
								<ExpandableButton
									variant="secondary"
									label={isLocked ? "Unlock Characters" : "Lock Characters"}
									onClick={() => setIsLocked(!isLocked)}
									data-pw={"lock-characters"}
								>
									{isLocked ? (
										<LockIcon className="size-6" />
									) : (
										<LockOpenIcon className="size-6" />
									)}
								</ExpandableButton>
							</FabButtonWrapper>
						</TooltipTrigger>
						<TooltipContent side="left">
							<p>Lock/Unlock Characters</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<FabButtonWrapper>
					<ExpandableButton
						variant="default"
						label="Create Character"
						onClick={() => openCharacterEditDialog(undefined)}
						data-pw={"create-character"}
					>
						<PlusIcon className="size-6" />
					</ExpandableButton>
				</FabButtonWrapper>
			</div>
		</>
	);
}
