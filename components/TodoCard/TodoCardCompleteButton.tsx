import { useToast } from "@/components/ui/use-toast";

import { Character, useMainStore } from "@/providers/MainStoreProvider";
import { raids } from "@/lib/raids";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import { MouseEventHandler, useState } from "react";

interface Props {
  charId: string;
  raidId: string;
  assignedGates: Character["assignedRaids"][string];
}

export default function TodoCardCompleteButton({
  charId,
  raidId,
  assignedGates,
}: Props) {
  const mainStore = useMainStore();
  const raid = raids[raidId];
  const { toast } = useToast();
  const [increase, setIncrease] = useState(false);

  const completedlen = Object.values(assignedGates).reduce(
    (acc, ag) => (ag.completed ? acc + 1 : acc),
    0,
  );

  const isChecked = Object.keys(assignedGates).length === completedlen;

  if (!raid) return null;

  const handleClick: MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();

    if (event.button === 0) {
      setIncrease(true);
      if (isChecked) return;
      try {
        mainStore.raidAction({
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
      setIncrease(false);
      if (completedlen === 0) return;
      try {
        mainStore.raidAction({
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
      className="shadow bg-primary/30 w-16 h-8 rounded-lg flex items-center relative overflow-hidden"
      onClick={handleClick}
      onContextMenu={handleClick}
    >
      <div
        className="absolute left-0 right-0 text-center z-10 text-primary-foreground"
        style={{ fontFeatureSettings: "'tnum' 1" }}
      >
        <AnimatePresence initial={false}>
          <div className="flex flex-row justify-center">
            <motion.div
              key={"ap" + completedlen}
              className="w-fit"
              initial={{
                opacity: 0,
                rotate:
                  completedlen === Object.keys(assignedGates).length
                    ? -120
                    : increase
                      ? -40
                      : 40,
              }}
              animate={{
                opacity: 1,
                rotate: 0,
              }}
              exit={{
                opacity: 0,
              }}
            >
              {isChecked ? (
                <CheckIcon />
              ) : (
                <span className="text-nowrap">{`${completedlen}`}</span>
              )}
            </motion.div>
            {!isChecked && (
              <span>{`/${Object.keys(assignedGates).length}`}</span>
            )}
          </div>
        </AnimatePresence>
      </div>
      <motion.div
        animate={{
          width: `${(completedlen / Object.keys(assignedGates).length) * 100}%`,
        }}
        initial={false}
        className="bg-primary h-full"
      />
    </div>
  );
}
