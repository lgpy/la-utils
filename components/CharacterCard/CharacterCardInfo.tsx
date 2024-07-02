import { useTheme } from "next-themes";
import clsx from "clsx";

import getClassIcon from "../class-icons/factory";
import { Character } from "@/stores/character";
import { Sword, SwordsIcon } from "lucide-react";
import { Separator } from "../ui/separator";

interface Props {
  char: Character;
}

export default function CharacterCardInfo({ char }: Props) {
  const Icon = getClassIcon(char.class, { size: 40 });
  const { theme } = useTheme();

  return (
    <div className="flex flex-row gap-2 items-center">
      {Icon}
      <div>
        <span className="text-sm text-default-500">{char.class}</span>
        <h2>{char.name}</h2>
        <div
          className={clsx("flex items-center gap-x-1 text-sm  font-semibold", {
            "text-[#eed49f]": theme === "dark",
            "text-[#df8e1d]": theme === "light",
          })}
        >
          <SwordsIcon />
          {char.itemLevel}
        </div>
      </div>
    </div>
  );
}
