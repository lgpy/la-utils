import {
  EditCharacter,
  NewCharacter,
  SetType,
  zodEditChar,
  zodNewChar,
} from "./character";
import { v4 as uuidv4 } from "uuid";

export function updateCharacter(
  set: SetType,
  charId: string,
  char: EditCharacter,
) {
  const updatedChar = zodEditChar.parse(char);
  set((state) => {
    let found = false;
    const updatedChars = state.characters.map((c) => {
      if (c.id === charId) {
        found = true;

        return {
          ...c,
          ...updatedChar,
          id: c.id,
        };
      }

      return c;
    });

    if (!found) {
      throw new Error("Character not found");
    }

    return { ...state, characters: updatedChars };
  });
}

export function CreateCharacter(set: SetType, char: NewCharacter) {
  const newc = zodNewChar.parse(char);
  set((state) => {
    return {
      ...state,
      characters: [
        ...state.characters,
        {
          name: newc.name,
          class: newc.class,
          itemLevel: newc.itemLevel,
          id: uuidv4(),
          raids: {},
          completedRaids: {},
          tasks: [],
        },
      ],
    };
  });
}

export function deleteCharacter(set: SetType, charId: string) {
  set((state) => {
    const updatedChars = state.characters.filter((c) => c.id !== charId);

    return { ...state, characters: updatedChars };
  });
}
