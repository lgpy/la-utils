import { Character, useMainStore } from "@/hooks/mainstore";
import { raids } from "@/lib/raids";
import { AnimatePresence, motion } from "framer-motion";
import { MouseEventHandler } from "react";

interface Props {
  charId: string;
  raidId: string;
  assignedGates: Character["assignedRaids"][string];
}

function SingularButton({
  onClick,
  active,
}: {
  onClick: MouseEventHandler<HTMLDivElement>;
  active: boolean;
}) {
  return (
    <div
      className="size-5 bg-surface1 rounded-full flex items-center justify-center cursor-pointer shadow-lg"
      onClick={onClick}
      onContextMenu={onClick}
    >
      <AnimatePresence>
        {active && (
          <motion.div
            style={{
              width: "0.75rem",
              height: "0.75rem",
              backgroundColor: "hsl(var(--mauve))",
              borderRadius: "9999px",
            }}
            initial={{
              scale: 0,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            exit={{
              scale: 0,
              opacity: 0,
            }}
          ></motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TodoCardCompleteButtonV2({
  charId,
  raidId,
  assignedGates,
}: Props) {
  const { state, hasHydrated } = useMainStore();

  const buttons = Object.entries(assignedGates).map(([gateId, gate]) => {
    const raid = raids[raidId];
    if (!raid) return null;

    const handleClick: MouseEventHandler<HTMLDivElement> = (event) => {
      event.preventDefault();

      if (event.shiftKey && event.type === "click") {
        state.toggleAllGates(charId, raidId);
      } else if (event.shiftKey && event.type === "contextmenu") {
        state.untoggleAllGates(charId, raidId);
      } else if (event.type === "click") {
        state.toggleGate(charId, raidId, gateId);
      } else if (event.type === "contextmenu") {
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
        />
      </div>
    );
  });

  return buttons;
}
