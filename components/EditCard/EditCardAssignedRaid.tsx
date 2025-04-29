import { raids, shortenDifficulty, shortestDifficulty } from "@/lib/raids";
import { EllipsisIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Character, useMainStore } from "@/providers/MainStoreProvider";

interface Props {
  char: Character;
  raidId: string;
  openRaidDialog: () => void;
}

export default function EditCardAssignedRaid({
  char,
  raidId,
  openRaidDialog,
}: Props) {
  const mainStore = useMainStore();

  const assignedRaid = char.assignedRaids[raidId];
  const raid = raids[raidId];

  if (!assignedRaid || !raid) return null;

  return (
    <div className="flex flex-row justify-between items-center gap-2 p-3">
      <div className="flex flex-col grow min-w-0 items-start gap-1.5">
        <p>{raid.name}</p>
        <div className="flex flex-row gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <p className="text-muted-foreground text-xs truncate">
                  {Object.values(assignedRaid)
                    .map((g) => `${shortestDifficulty(g.difficulty)}`)
                    .join("")}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {Object.entries(assignedRaid)
                    .map(
                      ([gId, g]) => `${gId} ${shortenDifficulty(g.difficulty)}`,
                    )
                    .join(", ")}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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
            className="text-destructive focus:bg-destructive/20 focus:text-destructive"
            onClick={() => mainStore.charDelRaid(char.id, raidId)}
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
