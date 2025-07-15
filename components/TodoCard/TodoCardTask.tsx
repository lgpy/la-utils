import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Character } from "@/stores/main-store/provider";

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
