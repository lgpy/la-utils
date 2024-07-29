import { getRaids } from "@/lib/chars";
import { raids } from "@/lib/raids";
import { cn } from "@/lib/utils";
import { ValueOf } from "next/dist/shared/lib/constants";
import { MouseEventHandler } from "react";
import { useToast } from "../ui/use-toast";
import { useMainStore } from "@/hooks/mainstore";

interface Props {
  charId: string;
  raidId: string;
  assignedGates: ValueOf<ReturnType<typeof getRaids>>["gates"];
}

export default function TodoRaidCheckbox({
  charId,
  raidId,
  assignedGates,
}: Props) {
  const store = useMainStore();
  const raid = raids.find((r) => r.id === raidId);
  const { toast } = useToast();

  if (!raid) return null;

  const completedlen = assignedGates.reduce(
    (acc, ag) => (ag.completed ? acc + 1 : acc),
    0,
  );
  const isChecked = assignedGates.length === completedlen;

  const handleClick: MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();

    if (event.button === 0) {
      if (isChecked) return;
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
      if (completedlen === 0) return;
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
            "bg-primary border-white/60": ag.completed,
            "border-white/30 bg-primary/30": !ag.completed,
            "rounded-l-lg": i === 0,
            "rounded-r-lg": i === assignedGates.length - 1,
          })}
        />
      ))}
    </div>
  );
}
