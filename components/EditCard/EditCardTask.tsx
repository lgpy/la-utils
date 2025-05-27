import { Button } from "@/components/ui/button";
import { Task } from "@/lib/tasks";
import { PencilIcon } from "lucide-react";

interface Props {
  task: Task;
  openTaskDialog: () => void;
}

export default function EditCardTask({ task, openTaskDialog }: Props) {
  return (
    <div className="flex flex-row justify-between items-center h-full p-3">
      <div className="flex flex-col grow min-w-0 items-start gap-1.5">
        <p>{task.name}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={openTaskDialog}>
        <PencilIcon />
      </Button>
    </div>
  );
}
