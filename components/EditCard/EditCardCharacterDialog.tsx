import ClassIcon from "@/components/class-icons/ClassIcon";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
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
import { Class } from "@/lib/classes";
import { type Character, useMainStore } from "@/providers/MainStoreProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2Icon, TrashIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
	name: z.string().min(2).max(50),
	itemLevel: z.number().int().min(0).max(9999),
	class: z.nativeEnum(Class),
	isGoldEarner: z.boolean(),
});

const classes = Object.values(Class);

interface Props {
	isOpen: boolean;
	close: () => void;
	existingCharacter?: Character;
}

export default function EditCardCharacterDialog({
	isOpen,
	close,
	existingCharacter,
}: Props) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			class: undefined,
			itemLevel: undefined,
			name: "",
			isGoldEarner: false,
		},
	});
	const mainStore = useMainStore();

	function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			if (existingCharacter !== undefined)
				mainStore.updateCharacter(existingCharacter.id, values);
			else mainStore.createCharacter(values);
			close();
			toast.success(
				`Character ${existingCharacter ? "updated" : "created"} successfully!`,
			);
		} catch (error) {
			toast.error(
				`Failed to ${existingCharacter ? "update" : "create"} character!`,
			);
		}
	}

	const deleteCharacter = () => {
		if (!existingCharacter) return;
		if (!window.confirm("Are you sure you want to delete this character?"))
			return;
		const index = mainStore.characters.findIndex(
			(c) => c.id === existingCharacter.id,
		);
		mainStore.deleteCharacter(existingCharacter.id);
		close();
		toast.success("Character deleted successfully!", {
			action: {
				label: "Undo",
				onClick: () => {
					mainStore.restoreCharacter(existingCharacter, index);
					toast.success("Character restored successfully!");
				},
				props: {
					"data-pw": "undo-char-delete",
				},
			},
		});
	};

	useEffect(() => {
		if (!isOpen) return;
		form.reset({
			name: existingCharacter?.name ?? "",
			itemLevel: existingCharacter?.itemLevel,
			class: existingCharacter?.class,
			isGoldEarner: existingCharacter?.isGoldEarner ?? false,
		});
	}, [existingCharacter, isOpen, form]);

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-primary">
						{existingCharacter ? "Update Character" : "Create Character"}
					</DialogTitle>
					<DialogDescription>
						{existingCharacter
							? "Update your character's information"
							: "Create a new character"}
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						id="char-form"
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
										<Input
											placeholder="Your character's name..."
											{...field}
											data-pw="char-name"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="class"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Class</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue
													placeholder="Your character's class..."
													data-pw="char-class-value"
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{classes
												.sort((a, b) => a.localeCompare(b))
												.map((c) => (
													<SelectItem
														key={c}
														value={c}
														className="flex items-center"
													>
														<div className="flex items-center gap-2">
															<ClassIcon c={c} className="size-6" />
															{c}
														</div>
													</SelectItem>
												))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex flex-row items-end gap-5">
							<FormField
								control={form.control}
								name="itemLevel"
								render={({ field }) => (
									<FormItem className="w-1/2">
										<FormLabel>Item level</FormLabel>
										<FormControl>
											<Input
												placeholder="Your character's item level..."
												type="number"
												max={3000}
												step={10}
												min={0}
												{...field}
												onChange={(event) =>
													field.onChange(+event.target.value)
												}
												data-pw="char-item-level"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="isGoldEarner"
								render={({ field }) => (
									<FormItem className="flex flex-row gap-2 items-center space-y-0 mb-2.5">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
												className="size-5"
											/>
										</FormControl>
										<FormLabel>Is Gold Earner?</FormLabel>
									</FormItem>
								)}
							/>
						</div>
					</form>
				</Form>
				<DialogFooter>
					{existingCharacter && (
						<Button
							variant="destructive"
							onClick={deleteCharacter}
							disabled={!existingCharacter}
							size="icon"
							className="mr-auto"
							data-pw="char-delete-button"
						>
							<Trash2Icon />
						</Button>
					)}
					<Button variant="ghost" onClick={close} data-pw="cancel-button">
						Cancel
					</Button>
					<Button type="submit" form="char-form" data-pw="confirm-button">
						Confirm
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
