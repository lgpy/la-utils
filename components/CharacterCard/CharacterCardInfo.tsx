import getClassIcon from "../class-icons/factory";
import { Character } from "@/stores/character";
import { Sword, SwordsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  char: Character;
}

export default function CharacterCardInfo({ char }: Props) {
  const Icon = getClassIcon(char.class, { size: 40 });

  return (
    <div className="flex flex-row gap-2 items-center">
      {Icon}
      <div>
        <span className="text-xs text-default-500 text-muted-foreground">
          {char.class}
        </span>
        <h2 className="text-primary font-bold">{char.name}</h2>
        <div
          className={cn(
            "flex items-center text-sm font-semibold dark:text-[#eed49f] text-[#df8e1d]",
          )}
        >
          <SwordsIcon className="size-5 mr-1" />
          {char.itemLevel}
        </div>
      </div>
    </div>
  );
}
