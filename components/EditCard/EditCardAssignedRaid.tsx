import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { raidData } from "@/lib/game-info";
import { shortenDifficulty, shortestDifficulty } from "@/lib/raids";
import { type Character, useMainStore } from "@/stores/main-store/provider";
import { EllipsisIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

interface Props {
	char: Character;
	raidId: string;
	openRaidDialog: () => void;
}

export default function EditCardAssignedRaid({
	char,
	raidId,
	openRaidDialog,
}: Props) {
	const mainStore = useMainStore();

	const [shouldOpenDialog, setShouldOpenDialog] = useState(false);

	const assignedRaid = char.assignedRaids[raidId];
	const raid = raidData.get(raidId);

	if (!assignedRaid || !raid) return null;

	return (
		<div className="flex flex-row justify-between items-center gap-2 p-3">
			<div className="flex flex-col grow min-w-0 items-start gap-1.5">
				<p>{raid.name}</p>
				<div className="flex flex-row gap-1">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger>
								<p className="text-muted-foreground text-xs truncate">
									{Object.values(assignedRaid)
										.map((g) => `${shortestDifficulty(g.difficulty)}`)
										.join("")}
								</p>
							</TooltipTrigger>
							<TooltipContent>
								<p>
									{Object.entries(assignedRaid)
										.map(
											([gId, g]) => `${gId} ${shortenDifficulty(g.difficulty)}`
										)
										.join(", ")}
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>
			<DropdownMenu
				onOpenChange={(open) => {
					if (!open && shouldOpenDialog) {
						openRaidDialog();
						setShouldOpenDialog(false);
					}
				}}
			>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						data-pw={"assigned-raid-ellipsis"}
					>
						<EllipsisIcon />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem
						onClick={() => {
							setShouldOpenDialog(true);
						}}
						data-pw={"assigned-raid-edit"}
					>
						<PencilIcon />
						<span>Edit</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => mainStore.charDelRaid(char.id, raidId)}
						data-pw={"assigned-raid-delete"}
						variant="destructive"
					>
						<Trash2Icon />
						<span>Delete Raid</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
