"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useMainStore, useSettingsStore } from "@/stores/main-store/provider";
import { useMemo } from "react";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import ClassIcon from "./class-icons/ClassIcon";
import { Separator } from "./ui/separator";
import { raidData } from "@/lib/game-info";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function RaidUploadManagerDialog({ open, onOpenChange }: Props) {
	const settingsStore = useSettingsStore((store) => store);
	const mainStore = useMainStore();

	const isLoading = !settingsStore.hasHydrated || !mainStore.hasHydrated;

	const data = useMemo(
		() =>
			mainStore.characters.map((character) => {
				const assignedRaids = Object.keys(character.assignedRaids).map(
					(raidId) => {
						const ignoreRaid = settingsStore.state.upload.ignoreRaids.some(
							(ignore) => ignore.cId === character.id && ignore.rId === raidId
						);

						return {
							id: raidId,
							name: raidData.get(raidId)?.name || raidId,
							ignore: ignoreRaid,
						};
					}
				);
				return {
					id: character.id,
					name: character.name,
					class: character.class,
					assignedRaids: assignedRaids,
				};
			}),
		[settingsStore.state.upload.ignoreRaids, mainStore]
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="lg:min-w-5xl">
				<DialogHeader>
					<DialogTitle>Manage shared Raids</DialogTitle>
					<DialogDescription>
						Untick the raids that you dont want to share with your friends.
					</DialogDescription>
				</DialogHeader>
				{isLoading ? (
					<div className="flex items-center justify-center h-32">
						<span className="text-muted-foreground">Loading...</span>
					</div>
				) : (
					<ScrollArea className="max-h-[70vh] p-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{data.map((character) => (
								<div
									key={character.id}
									className="p-4 border rounded-md space-y-2"
								>
									<div className="flex items-center justify-between">
										<h3 className="text-lg font-semibold">{character.name}</h3>
										<ClassIcon c={character.class} className="size-6" />
									</div>
									<Separator />
									<ul className="space-y-2">
										{character.assignedRaids.map((raid) => (
											<li
												key={raid.id}
												className="flex items-center justify-between"
											>
												<span>{raid.name}</span>
												<Checkbox
													checked={!raid.ignore}
													onCheckedChange={(checked) => {
														if (checked) {
															settingsStore.state.removeIgnoreRaid(
																character.id,
																raid.id
															);
														} else {
															settingsStore.state.addIgnoreRaid(
																character.id,
																raid.id
															);
														}
													}}
												/>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</ScrollArea>
				)}
			</DialogContent>
		</Dialog>
	);
}
