import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Character } from "@/stores/main-store/provider";
import CompleteButton from "../CompleteButton";

type Props = {
	task: Character["tasks"][number];
	complete: (fully: boolean) => void;
	incomplete: (fully: boolean) => void;
};

export default function TodoCardTask({ task, complete, incomplete }: Props) {
	return (
		<div
			className={cn(
				"flex flex-row justify-between items-center gap-2 transition",
				{
					"bg-primary/10": task.completed,
					"p-3": task.completionState[1] === 1,
					"px-3 py-2": task.completionState[1] !== 1,
				}
			)}
		>
			<p>{task.name}</p>
			{task.completionState[1] === 1 ? (
				<Checkbox
					className="size-5 border-primary"
					checked={task.completed}
					onMouseDown={
						task.completed ? () => incomplete(true) : () => complete(true)
					}
				/>
			) : (
				<CompleteButton
					completed={task.completionState[0]}
					total={task.completionState[1]}
					onDecrease={(shiftKey) => incomplete(shiftKey)}
					onIncrease={(shiftKey) => complete(shiftKey)}
				/>
			)}
		</div>
	);
}
