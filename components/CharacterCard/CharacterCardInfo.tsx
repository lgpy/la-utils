import { SwordsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import ClassIcon from "../class-icons/ClassIcon";
import { Character } from "@/hooks/mainstore";

interface Props {
  char: Character;
}

export default function CharacterCardInfo({ char }: Props) {
  return (
    <div className="flex flex-row gap-2 items-center">
      <ClassIcon c={char.class} className="size-10" />
      <div>
        <span className="text-xs text-default-500 text-muted-foreground">
          {char.class}
        </span>
        <h2 className="font-bold">{char.name}</h2>
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
