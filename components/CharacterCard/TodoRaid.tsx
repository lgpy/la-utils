import { raids, shortenDifficulty, shortestDifficulty } from "@/lib/raids";
import { Character } from "@/stores/character";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import TodoRaidCheckbox from "./TodoRaidCheckBox";

interface Props {
  char: Character;
  raidId: string;
}

export default function TodoRaid({ char, raidId }: Props) {
  const raid = raids.find((r) => r.id === raidId);
  const assignedRaid = char.raids[raidId] ?? [];

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
      <TodoRaidCheckbox
        assignedGates={assignedRaid.gates}
        charId={char.id}
        raidId={raidId}
      />
    </div>
  );
}
