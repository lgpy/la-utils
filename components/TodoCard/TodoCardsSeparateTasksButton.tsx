"use client";

import { useMainStore } from "@/stores/main-store/provider";
import { Toggle } from "../ui/toggle";
import { ClipboardListIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  showTasks: boolean;
  setShowTasks: (value: boolean) => void;
}

export default function TodoCardsSeparateTasksButton({ showTasks, setShowTasks }: Props) {
  const mainStore = useMainStore();

  const tasks = mainStore.characters.flatMap((char) => char.tasks).filter((task) => !task.completed);

  const dailyTasks = tasks.filter((task) => task.type === "daily");
  const weeklyTasks = tasks.filter((task) => task.type === "weekly");
  const restedTasks = tasks.filter((task) => task.type === "rested");

  return (
    <div className={cn("hidden absolute top-20 left-4 md:flex flex-col gap-2 w-36 text-center bg-ctp-base rounded-base border-2 border-border p-2")}>
      <Toggle aria-label="Toggle italic" pressed={showTasks} onPressedChange={setShowTasks}>
        <ClipboardListIcon />
        Show Tasks
      </Toggle>
      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
        <span>{dailyTasks.length} Daily</span>
        <span>{restedTasks.length} Rested</span>
        <span>{weeklyTasks.length} Weekly</span>
      </div>
    </div>
  )
}
