import ClassIcon from "@/components/class-icons/ClassIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sortRaidKeys } from "@/lib/chars";
import { cn } from "@/lib/utils";
import type { Character } from "@/stores/main-store/provider";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { MoveIcon, PencilIcon, PlusIcon, SwordsIcon } from "lucide-react";
import { Fragment, useMemo } from "react";
import CharacterCardAssignedRaid from "./EditCardAssignedRaid";
import { TaskType } from "@/generated/prisma";

type Props = {
	char: Character;
	editCharacter: () => void;
	openRaidDialog: (raidId?: string) => void;
	openTaskDialog: () => void;
	movable?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export default function EditCard(props: Props) {
	const [parent] = useAutoAnimate();
	const [parent2] = useAutoAnimate();
	const {
		char,
		editCharacter,
		openRaidDialog,
		openTaskDialog,
		movable = false,
		...divProps
	} = props;

	const ar = Object.keys(char.assignedRaids)
		.sort(sortRaidKeys)
		.map((raidId, i, keys) => (
			<Fragment key={char.id + raidId}>
				<CardContent data-pw={`character-assigned-raid-${i}`} className="p-0">
					<CharacterCardAssignedRaid
						char={char}
						openRaidDialog={() => openRaidDialog(raidId)}
						raidId={raidId}
					/>
				</CardContent>
				{i < keys.length - 1 && <Separator className="opacity-75" />}
			</Fragment>
		));

	const tasksByType = useMemo(
		() =>
			Object.fromEntries(
				Object.values(TaskType).map((type) => [
					type,
					char.tasks.filter((t) => t.type === type),
				])
			),
		[char.tasks]
	);

	return (
		<Card className="h-fit w-56 py-0 gap-0 overflow-hidden" {...divProps}>
			<div className="p-4 flex flex-row gap-2 items-center relative">
				<ClassIcon c={char.class} className="size-10" />
				<div className="flex flex-col">
					<span
						className="text-xs text-default-500 text-muted-foreground"
						data-pw="character-class"
					>
						{char.class}
					</span>
					<h2 className="font-bold" data-pw="character-name">
						{char.name}
					</h2>
					<div
						className={cn(
							"flex items-center gap-1 text-sm font-semibold dark:text-[#eed49f] text-[#df8e1d]"
						)}
						data-pw="character-item-level"
					>
						<SwordsIcon className="size-5" />
						{char.itemLevel}
					</div>
				</div>
				{movable && (
					<MoveIcon className="mover size-4 absolute top-1 mx-auto right-0 left-0 mt-0! cursor-move" />
				)}
				<Button
					variant="ghost"
					size="icon"
					className="absolute top-1 right-1 m-0! size-8"
					onClick={() => editCharacter()}
					data-pw={"edit-character"}
				>
					<PencilIcon />
				</Button>
			</div>
			<Tabs defaultValue="raids" className="gap-0">
				<TabsList className="w-full bg-background/30 p-0 h-auto rounded-none">
					<TabsTrigger
						value="raids"
						className="w-full rounded-none border-b-0 border-l-0 text-foreground/70 data-[state=active]:text-foreground"
					>
						<p>
							Raids{" "}
							<span className="text-xs text-muted-foreground">
								({Object.keys(char.assignedRaids).length})
							</span>
						</p>
					</TabsTrigger>
					<TabsTrigger
						value="tasks"
						className="w-full rounded-none border-b-0 border-r-0 text-foreground/70 data-[state=active]:text-foreground"
					>
						<p>
							Tasks{" "}
							<span className="text-xs text-muted-foreground">
								({char.tasks.length})
							</span>
						</p>
					</TabsTrigger>
				</TabsList>
				<Separator />
				<TabsContent value="raids" className="m-0">
					<div ref={parent}>
						{ar}
						{ar.length === 0 && (
							<CardContent className="p-3 text-center">
								No raids assigned
							</CardContent>
						)}
					</div>
					<Separator />
					<CardContent className="p-0">
						<Button
							className="w-full rounded-t-none p-2"
							onClick={() => openRaidDialog()}
							variant="ghost"
							data-pw={"character-add-raid"}
						>
							<PlusIcon /> Add Raid
						</Button>
					</CardContent>
				</TabsContent>
				<TabsContent value="tasks" className="m-0">
					<div ref={parent2}>
						{Object.entries(tasksByType).map(
							([type, tasks], typeIdx, typeArr) =>
								tasks.length > 0 && (
									<Fragment key={type}>
										<CardContent className="p-1 text-center text-sm bg-background/60">
											{type.charAt(0).toUpperCase() + type.slice(1)}
										</CardContent>
										<Separator />
										{tasks.map((task, taskIdx) => (
											<Fragment key={task.id}>
												<div className="flex flex-row justify-between items-center h-full p-3">
													<div className="flex flex-col grow min-w-0 items-start gap-1.5">
														<p>{task.name}</p>
													</div>
												</div>
												{taskIdx < tasks.length - 1 && (
													<Separator className="opacity-75" />
												)}
											</Fragment>
										))}
										{typeIdx < typeArr.length - 1 && <Separator />}
									</Fragment>
								)
						)}

						{char.tasks.length === 0 && (
							<CardContent className="p-3 text-center">
								No tasks assigned
							</CardContent>
						)}
					</div>
					<Separator />
					<CardContent className="p-0">
						<Button
							className="w-full rounded-t-none px-0"
							onClick={() => openTaskDialog()}
							variant="ghost"
							data-pw={"character-add-task"}
						>
							<PencilIcon /> Manage Tasks
						</Button>
					</CardContent>
				</TabsContent>
			</Tabs>
		</Card>
	);
}
