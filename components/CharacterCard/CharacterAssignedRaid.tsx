import { Character, useMainStore } from "@/hooks/mainstore";
import { raids, shortenDifficulty, shortestDifficulty } from "@/lib/raids";
import { EllipsisIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

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
  const { state, hasHydrated } = useMainStore();

  const assignedRaid = char.raids[raidId];
  const raid = raids.find((r) => r.id === raidId);

  if (!assignedRaid || !raid) return null;

  return (
    <div className="flex flex-row justify-between items-center gap-2">
      <div className="flex flex-col grow min-w-0 items-start">
        <span>{raid.name}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className="text-muted-foreground text-xs truncate">
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
          <Button
            variant="ghost"
            size="icon"
            data-pw={`assigned-raid-ellipsis`}
          >
            <EllipsisIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => openRaidDialog()}
            data-pw={`assigned-raid-edit`}
          >
            <PencilIcon className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => state.charDelRaid(char.id, raid.id)}
            data-pw={`assigned-raid-delete`}
          >
            <Trash2Icon className="mr-2 h-4 w-4" />
            <span>Delete Raid</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
