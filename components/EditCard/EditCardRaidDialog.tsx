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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Difficulty } from "@/generated/prisma";
import { raidData, Raid } from "@/lib/game-info";
import { type Character, useMainStore } from "@/stores/main-store/provider";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
		return raidData.raids.entries().reduce(
			(acc, [raidkey, raid]) => {
				const hasGatesbellowilvl = raid.gates
					.values()
					.some((gate) =>
						gate.difficulties
							.values()
							.some((diff) => diff.itemlevel <= character.itemLevel)
					);
				if (
					(character.assignedRaids[raidkey] === undefined &&
						hasGatesbellowilvl) ||
					raidkey === raidId
				)
					acc[raidkey] = raid;
				return acc;
			},
			{} as Record<string, Raid>
		);
	}, [raidId, character.assignedRaids, character.itemLevel]);

	function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			const raid = raidData.get(values.raidId);
			if (!raid) throw new Error("Raid not found!");

			const gateKeys = Array.from(raid.gates.keys());
			const gates = values.gates.reduce(
				(acc, diff, index) => {
					acc[gateKeys[index]] = diff === "none" ? undefined : diff;
					return acc;
				},
				{} as Record<string, Difficulty | undefined>
			);

			const fgates = Object.fromEntries(
				Object.entries(gates).filter(([, value]) => value !== undefined)
			) as Record<string, Difficulty>;

			if (raidId !== undefined)
				mainStore.charEditRaid(character.id, raidId, fgates);
			else mainStore.charAddRaid(character.id, values.raidId, fgates);

			close();
			toast.success(`Raid ${raidId ? "updated" : "added"} successfully!`);
		} catch {
			toast.error(`Failed to ${raidId ? "update" : "add"} raid!`);
		}
	}

	const watchRaidId = form.watch("raidId");

	const checkBoxGroups = useMemo(() => {
		if (!watchRaidId) return [];
		const raid = raidData.get(watchRaidId);
		if (!raid) return [];
		return Array.from(
			raid.gates.entries().map(([gateId, gate], gateIndex) => {
				const checkboxes = Array.from(
					gate.difficulties.entries().map(([difficulty, diffData]) => {
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
					})
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
			})
		);
	}, [character.itemLevel, form.control, watchRaidId]);

	useEffect(() => {
		if (raidId !== undefined && watchRaidId !== raidId) return;
		const actualRaid = raidData.get(watchRaidId);
		if (actualRaid) {
			form.reset({
				raidId: actualRaid ? watchRaidId : "",
				gates: Array.from(
					actualRaid.gates
						.values()
						.map(
							(gateInfo) =>
								Array.from(gateInfo.difficulties.entries()).findLast(
									([, diffData]) => diffData.itemlevel <= character.itemLevel
								)?.[0] ?? "none"
						)
				),
			});
		}
	}, [form, watchRaidId, character.itemLevel, raidId]);

	useEffect(() => {
		if (!isOpen) {
			form.reset({
				raidId: raidId || "",
				gates: [],
			});
			return;
		}

		if (raidId === undefined) {
			form.reset({
				raidId: "",
				gates: [],
			});
		} else {
			form.reset({
				raidId: raidId,
				gates: Array.from(
					raidData
						.get(raidId)
						?.gates.keys()
						.map(
							(gateId) =>
								character.assignedRaids[raidId]?.[gateId]?.difficulty || "none"
						) || ([] as ("none" | "Solo" | "Normal" | "Hard" | undefined)[])
				),
			});
		}
	}, [isOpen, raidId, form, character.assignedRaids]);

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
										open={isOpen ? undefined : false}
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
