"use client";

import { client, OrpcOutputs } from "@/lib/orpc";
import { changelogEntrySchema } from "@/router/changelog.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { ChangelogDetailType } from "@/generated/prisma";
import { showAlert } from "../AlertDialog.hooks";
import { toast } from "sonner";

interface Props {
	data?: OrpcOutputs["changelog"]["getChangelogEntry"];
}

const formSchema = changelogEntrySchema
	.omit({
		id: true,
	})
	.extend({
		details: changelogEntrySchema.shape.details.element
			.extend({
				id: z.string(),
			})
			.array(),
	});

export default function ChangelogForm({ data }: Props) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: data?.title || "",
			date: data?.date || new Date(),
			description: data?.description || "",
			details:
				data?.details.map((d) => ({
					id: crypto.randomUUID(),
					description: d.description,
					type: d.type,
				})) || [],
			isVisible: data?.isVisible || false,
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		const uuid = crypto.randomUUID();
		toast.loading("Saving changelog entry...", { id: uuid });
		client.changelog
			.upsertChangelogEntry({
				id: data?.id,
				date: values.date,
				title: values.title,
				description: values.description,
				details: values.details.map((d) => ({
					description: d.description,
					type: d.type,
				})),
				isVisible: values.isVisible,
			})
			.then(() => {
				toast.success("Changelog entry saved successfully!", { id: uuid });
			})
			.catch((error) => {
				toast.error("Failed to save changelog entry", {
					id: uuid,
					description: error.message,
				});
			});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Title</FormLabel>
							<FormControl>
								<Input placeholder="Title" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="date"
					render={({ field }) => (
						<FormItem className="flex flex-col w-full">
							<FormLabel>Posted At</FormLabel>
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant={"outline"}
											className={cn(
												"w-full pl-3 text-left font-normal",
												!field.value && "text-muted-foreground"
											)}
										>
											{field.value ? (
												format(field.value, "PPP")
											) : (
												<span>Pick a date</span>
											)}
											<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={field.value}
										onSelect={field.onChange}
										disabled={(date) =>
											date > new Date() || date < new Date("1900-01-01")
										}
										captionLayout="dropdown"
									/>
								</PopoverContent>
							</Popover>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Textarea placeholder="Description" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="details"
					render={({ field: detailsField }) => (
						<FormItem>
							<div className="flex items-center justify-between">
								<FormLabel>Details</FormLabel>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() =>
										detailsField.onChange([
											...detailsField.value,
											{
												description: "",
												type: undefined,
												id: crypto.randomUUID(),
											},
										])
									}
								>
									Add Detail
								</Button>
							</div>
							{detailsField.value.map((detail, index) => (
								<FormField
									key={detail.id}
									control={form.control}
									name={`details.${index}`}
									render={() => (
										<FormItem className="grid grid-cols-[1fr_4fr_max-content] gap-2 items-center">
											<Select
												onValueChange={(v) =>
													form.setValue(
														`details.${index}.type`,
														v as ChangelogDetailType
													)
												}
												defaultValue={detail.type}
											>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Detail Type" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{Object.values(ChangelogDetailType).map((type) => (
														<SelectItem key={type} value={type}>
															{type.charAt(0).toUpperCase() + type.slice(1)}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormControl>
												<Input
													placeholder="Detail description"
													{...form.register(`details.${index}.description`)}
												/>
											</FormControl>
											<Button
												type="button"
												variant="destructive"
												onClick={async () => {
													try {
														const dec = await showAlert({
															title: "Remove Detail",
															description:
																"Are you sure you want to remove this detail?",
															confirmButton: {
																text: "Remove",
															},
															cancelButton: {
																text: "Cancel",
															},
														});
														if (!dec) return;
														form.setValue(
															`details`,
															detailsField.value.filter(
																(f) => f.id !== detail.id
															)
														);
													} catch (error) {
														console.error(error);
													}
												}}
											>
												Remove Detail
											</Button>
										</FormItem>
									)}
								/>
							))}
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="isVisible"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Is Visible</FormLabel>
							<FormControl>
								<Checkbox
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex flex-row gap-4 justify-end">
					<Button type="submit">Submit</Button>
				</div>
			</form>
		</Form>
	);
}
