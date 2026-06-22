import { StateActions } from "../main-store";
import * as v from 'valibot';
import { getIndexOrThrow } from "@/lib/array";
import { zodChar } from "../types";
import { Class } from "@/prisma/generated/enums";

export const zodNewChar = v.pick(zodChar, ["name", "class", "itemLevel", "isGoldEarner"])

export const zodEditChar = v.pick(zodChar, ["name", "class", "itemLevel", "isGoldEarner"])

export type CharacterActions = {
	createCharacter: (char: v.InferOutput<typeof zodNewChar>) => void;
	createSpacerChar: () => void;
	updateCharacter: (charId: string, char: v.InferOutput<typeof zodEditChar>) => void;
	deleteCharacter: (charId: string) => void;
	restoreCharacter: (char: v.InferOutput<typeof zodChar>, index: number) => void;
	reorderChars: (charIds: string[]) => void;
};

export const createCharActions: StateActions<CharacterActions> = (set) => ({
	createCharacter(char) {
		const newc = v.parse(zodNewChar, char);
		set((state) => {
			state.characters.push({
				name: newc.name.trim(),
				class: newc.class,
				itemLevel: newc.itemLevel,
				isGoldEarner: newc.isGoldEarner,
				id: crypto.randomUUID(),
				assignedRaids: {},
				tasks: [],
			});
		});
	},
	createSpacerChar() {
		const id = crypto.randomUUID();
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
		const updatedChar = v.parse(zodEditChar, char);
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
			const restoredChar = v.parse(zodChar, char);
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
