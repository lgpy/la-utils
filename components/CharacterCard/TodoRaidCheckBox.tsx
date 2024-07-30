import { useMainStore } from "@/hooks/mainstore";
import { getRaids } from "@/lib/chars";
import { raids } from "@/lib/raids";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import { ValueOf } from "next/dist/shared/lib/constants";
import { MouseEventHandler } from "react";
import { useToast } from "../ui/use-toast";

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

  const completedlen = assignedGates.reduce(
    (acc, ag) => (ag.completed ? acc + 1 : acc),
    0,
  );

  const isChecked = assignedGates.length === completedlen;

  if (!raid) return null;

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
      className="border-white/30 bg-primary/30 w-16 h-8 rounded-lg flex items-center relative overflow-hidden"
      onClick={handleClick}
      onContextMenu={handleClick}
    >
      <div
        className="absolute left-0 right-0 text-center z-10 text-white"
        style={{ fontFeatureSettings: "'tnum' 1" }}
      >
        <AnimatePresence initial={false}>
          <div className="flex flex-row justify-center">
            <motion.div
              key={"ap" + completedlen}
              className="w-fit"
              initial={{
                opacity: 0,
                rotate: completedlen === assignedGates.length ? 120 : undefined,
              }}
              animate={{
                opacity: 1,
                rotate: completedlen === assignedGates.length ? 0 : undefined,
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
            {!isChecked && <span>{`/${assignedGates.length}`}</span>}
          </div>
        </AnimatePresence>
      </div>
      <motion.div
        animate={{
          width: `${(completedlen / assignedGates.length) * 100}%`,
        }}
        initial={false}
        className={cn("bg-primary h-full")}
      />
    </div>
  );
}
