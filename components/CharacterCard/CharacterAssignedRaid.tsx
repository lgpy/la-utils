import { raids, shortenDifficulty, shortestDifficulty } from "@/lib/raids";
import { useCharactersStore } from "@/providers/CharactersStoreProvider";
import { Character } from "@/stores/character";
import { Button } from "../ui/button";
import { DeleteIcon, EllipsisIcon, PencilIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface Props {
  char: Character;
  raidId: string;
  openRaidDialog: () => void;
}

export default function CharacterCardAssignedRaid({
  char,
  raidId,
  openRaidDialog,
}: Props) {
  const characters = useCharactersStore((store) => store);

  const assignedRaid = char.raids[raidId];
  const raid = raids.find((r) => r.id === raidId);

  if (!assignedRaid || !raid) return null;

  return (
    <div className="flex flex-row justify-between items-center gap-2">
      <div className="flex flex-col grow min-w-0 items-start">
        <span className="text-primary">{raid.name}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className="text-primary/30 text-xs truncate">
                {assignedRaid.gates
                  .map((g) => `${shortestDifficulty(g.difficulty)}`)
                  .join("")}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {assignedRaid.gates
                  .map((g) => `${g.id} ${shortenDifficulty(g.difficulty)}`)
                  .join(", ")}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <EllipsisIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => openRaidDialog()}>
            <PencilIcon className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => characters.removeRaidFromCharacter(char.id, raid.id)}
          >
            <DeleteIcon className="mr-2 h-4 w-4" />
            <span>Delete Raid</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
