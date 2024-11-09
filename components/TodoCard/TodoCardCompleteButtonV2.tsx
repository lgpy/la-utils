import { Character, useMainStore } from "@/hooks/mainstore";
import { raids } from "@/lib/raids";
import { motion } from "framer-motion";
import { MouseEventHandler } from "react";

interface Props {
  charId: string;
  raidId: string;
  assignedGates: Character["assignedRaids"][string];
}

function SingularButton({
  onClick,
  active,
  index,
  total,
}: {
  onClick: MouseEventHandler<HTMLDivElement>;
  active: boolean;
  index: number;
  total: number;
}) {
  return (
    <div
      className="size-5 bg-surface1 rounded-full flex items-center justify-center cursor-pointer shadow-lg"
      onMouseDown={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      <motion.div
        className="size-3 bg-mauve rounded-full"
        initial={false}
        animate={active ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{
          delay: active
            ? index * (0.2 / total)
            : (total - index) * (0.2 / total),
          duration: 0.2,
        }}
      ></motion.div>
    </div>
  );
}

export default function TodoCardCompleteButtonV2({
  charId,
  raidId,
  assignedGates,
}: Props) {
  const { state, hasHydrated } = useMainStore();

  const buttons = Object.entries(assignedGates).map(
    ([gateId, gate], idx, arr) => {
      const raid = raids[raidId];
      if (!raid) return null;

      const handleClick: MouseEventHandler<HTMLDivElement> = (event) => {
        event.preventDefault();
        console.log(event);
        if (event.shiftKey && event.button === 0) {
          state.toggleAllGates(charId, raidId);
        } else if (event.shiftKey && event.button === 2) {
          state.untoggleAllGates(charId, raidId);
        } else if (event.button === 0) {
          state.toggleGate(charId, raidId, gateId);
        } else if (event.button === 2) {
          state.untoggleGate(charId, raidId, gateId);
        }
      };

      return (
        <div
          className="flex flex-col items-center justify-center"
          key={raidId + gateId}
        >
          <SingularButton
            key={gateId}
            active={gate.completed}
            onClick={handleClick}
            index={idx}
            total={arr.length}
          />
        </div>
      );
    },
  );

  return buttons;
}
