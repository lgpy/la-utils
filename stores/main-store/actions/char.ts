import { v4 as uuidv4 } from "uuid";
import { StateActions } from "../main-store";
import z from "zod";
import { getIndexOrThrow } from "@/lib/array";
import { zodChar } from "../types";
import { Class } from "@/generated/prisma";

export const zodNewChar = zodChar.pick({
	name: true,
	class: true,
	itemLevel: true,
	isGoldEarner: true,
});
export const zodEditChar = zodChar.pick({
	name: true,
	class: true,
	itemLevel: true,
	isGoldEarner: true,
});

export type CharacterActions = {
	createCharacter: (char: z.infer<typeof zodNewChar>) => void;
	createSpacerChar: () => void;
	updateCharacter: (charId: string, char: z.infer<typeof zodEditChar>) => void;
	deleteCharacter: (charId: string) => void;
	restoreCharacter: (char: z.infer<typeof zodChar>, index: number) => void;
	reorderChars: (charIds: string[]) => void;
};

export const createCharActions: StateActions<CharacterActions> = (set) => ({
	createCharacter(char) {
		const newc = zodNewChar.parse(char);
		set((state) => {
			state.characters.push({
				name: newc.name.trim(),
				class: newc.class,
				itemLevel: newc.itemLevel,
				isGoldEarner: newc.isGoldEarner,
				id: uuidv4(),
				assignedRaids: {},
				tasks: [],
			});
		});
	},
	createSpacerChar() {
		const id = uuidv4();
		const name = `Spacer ${id.slice(0, 4)}`;
		set((state) => {
			state.characters.push({
				name,
				class: Class.Berserker,
				itemLevel: 0,
				isGoldEarner: false,
				id: id,
				assignedRaids: {},
				tasks: [],
				isSpacer: true,
			});
		});
	},
	updateCharacter(charId, char) {
		const updatedChar = zodEditChar.parse(char);
		set((state) => {
			const charIndex = getIndexOrThrow(
				state.characters,
				(c) => c.id === charId,
				"Character not found"
			);
			updatedChar.name = updatedChar.name.trim();
			state.characters[charIndex] = {
				...state.characters[charIndex], // Preserve other properties
				...updatedChar,
			};
		});
	},
	deleteCharacter(charId) {
		set((state) => {
			const charIndex = getIndexOrThrow(
				state.characters,
				(c) => c.id === charId,
				"Character not found"
			);
			state.characters.splice(charIndex, 1);
		});
	},
	restoreCharacter(char, index) {
		set((state) => {
			const restoredChar = zodChar.parse(char);
			state.characters = [
				...state.characters.slice(0, index),
				restoredChar,
				...state.characters.slice(index),
			];
		});
	},
	reorderChars(charIds) {
		set((state) => {
			state.characters = state.characters.sort(
				(a, b) => charIds.indexOf(a.id) - charIds.indexOf(b.id)
			);
		});
	},
});
