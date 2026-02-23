import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { type Character, useMainStore } from "@/stores/main-store/provider";
import { ArrowLeftIcon, ArrowRightIcon, PencilIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface Props {
	character: Character;
	close: () => void;
	isOpen: boolean;
	openTaskDialog: (taskID: string | undefined) => void;
}

export default function EditCardTaskManagementDialog({
	character,
	isOpen,
	close,
	openTaskDialog,
}: Props) {
	const mainStore = useMainStore();

	const [assignedTaskIds, setAssignedTaskIds] = useState<Array<string>>([]);

	useEffect(() => {
		setAssignedTaskIds(character.tasks.map((task) => task.id));
	}, [character]);

	const assignedTasks = useMemo(() => {
		return assignedTaskIds
			.map((taskId) => {
				const taskInfo = mainStore.tasks.find((t) => t.id === taskId);
				if (taskInfo) {
					return {
						id: taskId,
						name: taskInfo.name,
						type: taskInfo.type,
						timesToComplete: taskInfo.timesToComplete,
					};
				}
				return null;
			})
			.filter((t) => t !== null);
	}, [mainStore.tasks, assignedTaskIds]);

	const availableTasks = useMemo(() => {
		return mainStore.tasks.filter((task) => {
			return !assignedTaskIds.some((assignedId) => assignedId === task.id);
		});
	}, [mainStore.tasks, assignedTaskIds]);

	function onSubmit() {
		try {
			mainStore.charAssignTasks(character.id, assignedTaskIds);
			toast.success("Task changes saved successfully!");
			close();
		} catch {
			toast.error(`Failed to save tasks from character!`);
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-primary">
						Manage Tasks - {character.name}
					</DialogTitle>
				</DialogHeader>
				<div className="grid grid-cols-2 gap-2">
					<div className="flex flex-col gap-2">
						<h1>Available Tasks</h1>
						{availableTasks.length === 0 && (
							<span className="text-muted-foreground text-sm">
								No available tasks
							</span>
						)}
						{availableTasks.map((t) => (
							<div key={t.id} className="flex items-center justify-between">
								<div className="flex flex-col">
									<span>{t.name}</span>
									<span className="text-xs font-light text-muted-foreground">
										{t.type} - {t.timesToComplete}x
									</span>
								</div>
								<div className="flex flex-row gap-1">
									<Button
										onClick={() => openTaskDialog(t.id)}
										size="icon"
										variant="outline"
									>
										<PencilIcon />
									</Button>
									<Button
										onClick={() => setAssignedTaskIds((ids) => [...ids, t.id])}
										size="icon"
										variant="default"
									>
										<ArrowRightIcon />
									</Button>
								</div>
							</div>
						))}
					</div>
					<div className="flex flex-col gap-2">
						<h1>Assigned Tasks</h1>
						{assignedTasks.length === 0 && (
							<span className="text-muted-foreground text-sm">
								No assigned tasks
							</span>
						)}
						{assignedTasks.map((t) => (
							<div key={t.id} className="flex items-center justify-between">
								<div className="flex flex-row gap-1">
									<Button
										onClick={() =>
											setAssignedTaskIds((ids) =>
												ids.filter((id) => id !== t.id)
											)
										}
										size="icon"
										variant="secondary"
									>
										<ArrowLeftIcon />
									</Button>
									<Button
										onClick={() => openTaskDialog(t.id)}
										size="icon"
										variant="outline"
									>
										<PencilIcon />
									</Button>
								</div>
								<div className="flex flex-col divide-accent text-end">
									<span>{t.name}</span>
									<span className="text-xs font-light text-muted-foreground">
										{t.type} - {t.timesToComplete}x
									</span>
								</div>
							</div>
						))}
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="secondary"
						className="mr-auto"
						onClick={() => openTaskDialog(undefined)}
					>
						Add New Task
					</Button>
					<Button variant="ghost" onClick={close} data-pw="form-cancel">
						Cancel
					</Button>
					<Button type="submit" onClick={onSubmit} data-pw="form-submit">
						Confirm
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
