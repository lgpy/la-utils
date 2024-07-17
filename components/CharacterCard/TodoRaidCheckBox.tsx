import { hasReset } from "@/lib/dates";
import { raids } from "@/lib/raids";
import { Character } from "@/stores/character";
import { MouseEventHandler } from "react";
import { Button } from "../ui/button";
import { useCharactersStore } from "@/providers/CharactersStoreProvider";
import { DateTime } from "luxon";
import { useToast } from "../ui/use-toast";
import { cn } from "@/lib/utils";

interface Props {
  charId: string;
  raidId: string;
  assignedGates: Character["raids"][string]["gates"];
}

export default function TodoRaidCheckbox({
  charId,
  raidId,
  assignedGates,
}: Props) {
  const store = useCharactersStore((store) => store);
  const raid = raids.find((r) => r.id === raidId);
  const { toast } = useToast();

  if (!raid) return null;

  const completed = assignedGates.filter((ag) => {
    if (!ag.completedDate) return false;
    const actualgate = raid.gates[ag.id];

    if (actualgate.hasReset !== undefined)
      return !actualgate.hasReset(DateTime.fromISO(ag.completedDate));
    else return !hasReset(DateTime.fromISO(ag.completedDate));
  });
  const isChecked = assignedGates.length === completed.length;

  const handleClick: MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();

    if (event.button === 0) {
      if (completed.length === assignedGates.length) return;
      try {
        store.raidAction({
          charId,
          raidId,
          mode: event.shiftKey ? "all" : "last",
          type: "complete",
        });
      } catch (e) {
        toast({
          variant: "destructive",
          title: "Error",
          description: event.shiftKey
            ? "Failed to complete all gates"
            : "Failed to complete last gate",
        });
      }
    } else if (event.button === 2) {
      if (completed.length === 0) return;
      try {
        store.raidAction({
          charId,
          raidId,
          mode: event.shiftKey ? "all" : "last",
          type: "uncomplete",
        });
      } catch (e) {
        toast({
          variant: "destructive",
          title: "Error",
          description: event.shiftKey
            ? "Failed to uncomplete all gates"
            : "Failed to uncomplete last gate",
        });
      }
    }
  };

  return (
    <div
      className="w-16 h-8 flex cursor-pointer"
      onClick={handleClick}
      onContextMenu={handleClick}
    >
      {assignedGates.map((ag, i) => (
        <div
          key={ag.id}
          className={cn("size-full transition", {
            "border-r-[1px]":
              ag.id !== assignedGates[assignedGates.length - 1].id,
            "bg-primary border-white/60": completed.some((c) => c.id === ag.id),
            "border-white/30 bg-primary/30": !completed.some(
              (c) => c.id === ag.id,
            ),
            "rounded-l-lg": i === 0,
            "rounded-r-lg": i === assignedGates.length - 1,
          })}
        />
      ))}
    </div>
  );
}
