import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { TaskType } from "@/generated/prisma";
import { useMainStore } from "@/stores/main-store/provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2Icon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
	name: z.string().min(2).max(100),
	type: z.nativeEnum(TaskType),
	timesToComplete: z.string(),
});

interface Props {
	close: () => void;
	isOpen: boolean;
	taskId?: string;
}

export default function EditCardTaskDialog({ isOpen, close, taskId }: Props) {
	const mainStore = useMainStore();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			type: "daily",
			timesToComplete: "1",
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			if (taskId !== undefined)
				mainStore.editTask(taskId, {
					name: values.name,
					timesToComplete: Number.parseInt(values.timesToComplete, 10),
					type: values.type,
				});
			else
				mainStore.addTask({
					name: values.name,
					timesToComplete: Number.parseInt(values.timesToComplete, 10),
					type: values.type,
				});

			close();
			toast.success(
				`Task has been ${taskId ? "updated" : "added"} successfully!`
			);
		} catch {
			toast.error(`Failed to ${taskId ? "update" : "add"} task!`);
		}
	}

	useEffect(() => {
		if (!isOpen) return;
		const task = mainStore.tasks.find((t) => t.id === taskId);
		const newValues = {
			name: task?.name || "",
			type: task?.type || "daily",
			timesToComplete: task?.timesToComplete || 1,
		};
		// Only reset if values actually changed
		const currentValues = form.getValues();
		if (
			currentValues.name !== newValues.name ||
			currentValues.type !== newValues.type ||
			Number.parseInt(currentValues.timesToComplete, 10) !==
				newValues.timesToComplete
		) {
			form.reset({
				name: newValues.name,
				type: newValues.type,
				timesToComplete: String(newValues.timesToComplete),
			});
		}
	}, [isOpen, taskId, form, mainStore]);

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-primary">
						{taskId ? "Update Task" : "Add Task"}
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						id="task-form"
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Your task's name..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="type"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Type</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value}
										open={isOpen ? undefined : false}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select the task type" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{Object.values(TaskType).map((type) => (
												<SelectItem key={type} value={type}>
													{type.charAt(0).toUpperCase() + type.slice(1)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="timesToComplete"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Times to Complete</FormLabel>
									<FormControl>
										<Input {...field} type="number" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</form>
				</Form>
				<DialogFooter>
					<div className="mr-auto flex flex-row justify-center gap-2">
						{taskId !== undefined && (
							<Button
								variant="destructive"
								onClick={() => {
									mainStore.delTask(taskId);
									close();
								}}
								size="icon"
								data-pw="char-delete-button"
							>
								<Trash2Icon />
							</Button>
						)}
					</div>
					<Button variant="ghost" onClick={close} data-pw="form-cancel">
						Cancel
					</Button>
					<Button type="submit" form="task-form" data-pw="form-submit">
						Confirm
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
