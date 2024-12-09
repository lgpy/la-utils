import { Checkbox } from "../ui/checkbox";
import { Character } from "@/providers/MainStoreProvider";
import { cn } from "@/lib/utils";

type Props = {
  task: Character["tasks"][number];
  toggleTask: () => void;
};

export default function TodoCardTask({ task, toggleTask }: Props) {
  return (
    <div
      className={cn(
        "flex flex-row justify-between items-center gap-2 p-3 transition",
        {
          "bg-primary/10": task.completed,
        },
      )}
    >
      <p>{task.name}</p>
      <Checkbox
        className="size-5 border-primary"
        checked={task.completed}
        onMouseDown={toggleTask}
      />
    </div>
  );
}
