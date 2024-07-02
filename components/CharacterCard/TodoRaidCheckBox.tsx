import { hasReset } from "@/lib/dates";
import { raids } from "@/lib/raids";
import { Character } from "@/stores/character";
import clsx from "clsx";
import { MouseEventHandler } from "react";
import { Button } from "../ui/button";
import { useCharactersStore } from "@/providers/CharactersStoreProvider";
import { DateTime } from "luxon";

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
      if (event.shiftKey) {
        if (isChecked) store.uncompleteRaid(charId, raidId);
        else store.completeRaid(charId, raidId);
      } else {
        if (completed.length === assignedGates.length)
          store.uncompleteRaid(charId, raidId);
        else
          store.completeRaid(
            charId,
            raidId,
            Object.values(assignedGates)[completed.length].id,
          );
      }
    } else if (event.button === 2) {
      if (event.shiftKey) {
        store.uncompleteRaid(charId, raidId);
      } else {
        if (completed.length === 0) return;
        store.uncompleteRaid(
          charId,
          raidId,
          completed[completed.length - 1].id,
        );
      }
    }
  };

  return (
    <div
      className="w-16 h-8 flex"
      onClick={handleClick}
      onContextMenu={handleClick}
    >
      {assignedGates.map((ag, i) => (
        <div
          key={ag.id}
          className={clsx("size-full transition", {
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
