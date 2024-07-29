import { getRaids } from "@/lib/chars";
import { raids } from "@/lib/raids";
import { cn } from "@/lib/utils";
import { ValueOf } from "next/dist/shared/lib/constants";
import { MouseEventHandler } from "react";
import { useToast } from "../ui/use-toast";
import { useMainStore } from "@/hooks/mainstore";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

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
      className="border-white/30 bg-primary/30 w-16 h-8 rounded-lg flex items-center relative overflow-hidden"
      onClick={handleClick}
      onContextMenu={handleClick}
    >
      <div className="absolute left-0 right-0 text-center z-10 text-white">
        {isChecked ? (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <CheckIcon className="mx-auto" />
            </motion.div>
          </AnimatePresence>
        ) : (
          <AnimatePresence>
            <motion.span
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >{`${completedlen}/${assignedGates.length}`}</motion.span>
          </AnimatePresence>
        )}
      </div>
      <motion.div
        animate={{
          width: `${(completedlen / assignedGates.length) * 100}%`,
        }}
        initial={{
          width: `${(completedlen / assignedGates.length) * 100}%`,
        }}
        className={cn("bg-primary h-full")}
      />
    </div>
  );
}
