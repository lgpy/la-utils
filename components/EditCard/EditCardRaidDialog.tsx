import { Difficulty, raids } from "@/lib/raids";
import { type Character, useMainStore } from "@/providers/MainStoreProvider";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

Difficulty;
const formSchema = z.object({
	raidId: z.string().min(2).max(50),
	gates: z.array(z.nativeEnum(Difficulty).or(z.literal("none"))),
});

interface Props {
	character: Character;
	close: () => void;
	isOpen: boolean;
	raidId?: string;
}

export default function EditCardRaidDialog({
	character,
	isOpen,
	close,
	raidId,
}: Props) {
	const [parent] = useAutoAnimate();
	const mainStore = useMainStore();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			raidId: raidId || "",
			gates: [],
		},
	});

	const filteredRaids = useMemo(() => {
		return Object.entries(raids).reduce(
			(acc, [raidkey, raid]) => {
				const hasGatesbellowilvl = Object.values(raid.gates).some((gate) =>
					Object.values(gate.difficulties).some(
						(diff) => diff.itemlevel <= character.itemLevel,
					),
				);
				if (
					(character.assignedRaids[raidkey] === undefined &&
						hasGatesbellowilvl) ||
					raidkey === raidId
				)
					acc[raidkey] = raid;
				return acc;
			},
			{} as typeof raids,
		);
	}, [raidId, character.assignedRaids, character.itemLevel]);

	function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			const raid = raids[values.raidId];
			if (!raid) throw new Error("Raid not found!");

			const gates = values.gates.reduce(
				(acc, diff, index) => {
					acc[Object.keys(raid.gates)[index]] =
						diff === "none" ? undefined : diff;
					return acc;
				},
				{} as Record<string, Difficulty | undefined>,
			);

			const fgates = Object.fromEntries(
				Object.entries(gates).filter(([, value]) => value !== undefined),
			) as Record<string, Difficulty>;

			if (raidId !== undefined)
				mainStore.charEditRaid(character.id, raidId, fgates);
			else mainStore.charAddRaid(character.id, values.raidId, fgates);

			close();
			toast.success(`Raid ${raidId ? "updated" : "added"} successfully!`);
		} catch (error) {
			toast.error(`Failed to ${raidId ? "update" : "add"} raid!`);
		}
	}

	const watchRaidId = form.watch("raidId");
	const actualRaid = useMemo(() => {
		return raids[watchRaidId];
	}, [watchRaidId]);

	const checkBoxGroups = useMemo(() => {
		if (!actualRaid) return [];
		return Object.entries(actualRaid.gates).map(([gateId, gate], gateIndex) => {
			const checkboxes = Object.entries(gate.difficulties).map(
				([difficulty, diffData]) => {
					if (diffData.itemlevel === null) return null;
					if (diffData.itemlevel > character.itemLevel) return null;
					return (
						<FormItem
							className="flex items-center space-x-3 space-y-0"
							key={`rgi${gateId}${difficulty}`}
						>
							<FormControl>
								<RadioGroupItem
									value={difficulty}
									className="text-secondary border-secondary"
								/>
							</FormControl>
							<FormLabel className="font-normal">{difficulty}</FormLabel>
						</FormItem>
					);
				},
			);
			return (
				<FormField
					key={`rg${gateId}`}
					control={form.control}
					name={`gates.${gateIndex}`}
					render={({ field }) => (
						<FormItem className="flex flex-row">
							<FormLabel className="w-6">{gateId}</FormLabel>
							<FormControl>
								<RadioGroup
									onValueChange={field.onChange}
									value={field.value}
									className="flex flex-row justify-around w-full mt-0! gap-2"
									data-pw={`difficulties-${gateId}`}
								>
									<FormItem className="flex items-center space-x-3 space-y-0">
										<FormControl>
											<RadioGroupItem
												value="none"
												className="text-secondary border-secondary"
											/>
										</FormControl>
										<FormLabel className="font-normal">None</FormLabel>
									</FormItem>
									{checkboxes}
								</RadioGroup>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			);
		});
	}, [actualRaid, character.itemLevel, form.control]);

	useEffect(() => {
		if (!isOpen) return;
		form.reset({
			raidId: actualRaid ? watchRaidId : "",
			gates: actualRaid
				? Object.keys(actualRaid.gates).map(
						(gateId) =>
							character.assignedRaids[watchRaidId]?.[gateId]?.difficulty ||
							"none",
					)
				: [],
		});
	}, [actualRaid, isOpen, character.assignedRaids, form, watchRaidId]);

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-primary">
						{raidId ? "Update Raid" : "Add Raid"} - {character.name}
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						id="char-form"
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="raidId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Raid</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
										disabled={raidId !== undefined}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select the raid" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{Object.entries(filteredRaids).map(([raidId, raid]) => (
												<SelectItem key={raidId} value={raidId}>
													{raid.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						{checkBoxGroups.length > 0 ? (
							<>
								<div>
									<FormLabel>Gates</FormLabel>
								</div>
								<div className="space-y-4" ref={parent}>
									{checkBoxGroups}
								</div>
							</>
						) : (
							<div className="text-muted-foreground text-sm">
								Select a raid to see its gates and difficulties.
							</div>
						)}
					</form>
				</Form>
				<DialogFooter>
					<Button variant="ghost" onClick={close} data-pw="form-cancel">
						Cancel
					</Button>
					<Button type="submit" form="char-form" data-pw="form-submit">
						Confirm
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
