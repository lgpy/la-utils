import PiggyBank from "@/components/PiggyBank";
import ClassIcon from "@/components/class-icons/ClassIcon";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getHighest3, parseGoldInfo, sortRaidKeys } from "@/lib/chars";
import { cn } from "@/lib/utils";
import {
	type Character,
	useMainStore,
	useSettingsStore,
} from "@/stores/main-store/provider";
import { Check, SwordsIcon } from "lucide-react";
import { motion } from "motion/react";
import { Fragment, useMemo } from "react";
import TodoCardCompleteButton from "./TodoCardCompleteButton";
import TodoCardCompleteButtonV2 from "./TodoCardCompleteButtonV2";
import TodoCardRaidV2 from "./TodoCardRaidV2";
import TodoCardTask from "./TodoCardTask";
import { TaskType } from "@/generated/prisma";

interface Props {
	char: Character;
	mode: "default" | "raids" | "tasks";
	hideCompleted?: boolean;
}

export default function TodoCard({ char, mode, hideCompleted }: Props) {
	const mainStore = useMainStore();
	const experimentsStore = useSettingsStore((store) => store);
	const highest3 = useMemo(() => {
		const goldInfo = parseGoldInfo(char.assignedRaids);
		const highest3 = getHighest3(
			char.assignedRaids,
			goldInfo,
			experimentsStore.state.experiments.ignoreThaemineIfNoG4
		);
		return highest3;
	}, [char, experimentsStore.state.experiments.ignoreThaemineIfNoG4]);

	const todoCardContent = useMemo(() => {
		const tasksGroupedByType = Object.fromEntries(
			Object.values(TaskType).map((type) => [
				type,
				char.tasks
					.filter((t) => t.type === type)
					.filter((t) => (hideCompleted ? !t.completed : true)),
			])
		);

		const assignedTasks = Object.entries(tasksGroupedByType)
			.map(([type, tasks], typeIdx, typeArr) =>
				tasks.length > 0 ? (
					<Fragment key={type}>
						<CardContent className="p-1 text-center text-sm bg-background/60">
							{type.charAt(0).toUpperCase() + type.slice(1)}
						</CardContent>
						<Separator />
						{tasks.map((task, i) => (
							<Fragment key={task.id}>
								<TodoCardTask
									task={task}
									complete={(fully) =>
										mainStore.charCompleteTask(char.id, task.id, fully)
									}
									incomplete={(fully) =>
										mainStore.charIncompleteTask(char.id, task.id, fully)
									}
								/>
								{i < tasks.length - 1 && <Separator className="opacity-75" />}
							</Fragment>
						))}
						{typeIdx < typeArr.length - 1 && <Separator />}
					</Fragment>
				) : null
			)
			.filter((el) => el !== null);

		const assignedRaids = Object.keys(char.assignedRaids)
			.sort(sortRaidKeys)
			.filter((raidId) => {
				if (!hideCompleted) return true;
				const raidGates = char.assignedRaids[raidId];
				return Object.values(raidGates).some((gate) => !gate.completed);
			})
			.map((raidId, i, keys) => (
				<Fragment key={char.id + raidId}>
					<CardContent
						className={cn("transition p-0", {
							"rounded-b-lg": i === keys.length - 1,
						})}
					>
						<TodoCardRaidV2
							raidId={raidId}
							raid={char.assignedRaids[raidId]}
							goldEarner={
								char.isGoldEarner &&
								highest3.thisWeek[raidId] !== undefined &&
								Object.keys(highest3.thisWeek).length <
									Object.keys(char.assignedRaids).length
							}
						>
							{experimentsStore.state.uiSettings.buttonV2 ? (
								<TodoCardCompleteButtonV2
									assignedGates={char.assignedRaids[raidId]}
									charId={char.id}
									raidId={raidId}
								/>
							) : (
								<TodoCardCompleteButton
									assignedGates={char.assignedRaids[raidId]}
									charId={char.id}
									raidId={raidId}
								/>
							)}
						</TodoCardRaidV2>
					</CardContent>
					{i < keys.length - 1 && <Separator className="opacity-75" />}
				</Fragment>
			));

		const hasRaidsAssigned = Object.keys(char.assignedRaids).length > 0;
		const hasTasksAssigned = char.tasks.length > 0;

		if (mode === "default" && char.tasks.length > 0) {
			const completedTasks = char.tasks.reduce(
				(acc, t) => (t.completed ? acc + 1 : acc),
				0
			);
			const completedRaids = Object.values(char.assignedRaids).reduce(
				(acc, r) => {
					if (Object.values(r).some((b) => !b.completed)) return acc;
					return acc + 1;
				},
				0
			);
			const completedGateCount = Object.values(char.assignedRaids).reduce(
				(acc, r) => {
					let count = acc;
					for (const gate of Object.values(r)) {
						if (gate.completed) count++;
					}
					return count;
				},
				0
			);
			const totalGateCount = Object.values(char.assignedRaids).reduce(
				(acc, r) => {
					return acc + Object.values(r).length;
				},
				0
			);

			return (
				<Tabs defaultValue="raids" className="gap-0">
					<TabsList className="w-full bg-primary/20 p-0 h-auto rounded-none">
						<TabsTrigger
							value="raids"
							className="w-full rounded-none relative group border-0 dark:data-[state=active]:text-primary-foreground data-[state=active]:text-foreground text-foreground/80 dark:text-primary-foreground/50 dark:data-[state=active]:bg-primary/30 data-[state=active]:bg-primary/30 shadow-none!"
						>
							<div className="flex items-center gap-1">
								<span>Raids</span>{" "}
								{completedRaids !== Object.keys(char.assignedRaids).length && (
									<span className="text-xs">
										({completedRaids}/{Object.keys(char.assignedRaids).length})
									</span>
								)}
								{completedRaids === Object.keys(char.assignedRaids).length && (
									<Check className="inline size-4" />
								)}
							</div>
							<div className="absolute left-0 bottom-0 h-1 w-full z-0 bg-primary/20 group-data-[state=active]:bg-primary/30" />
							<motion.div
								className="absolute left-1/2 bottom-0 z-0 h-1 bg-primary/40 group-data-[state=active]:bg-primary/50 transform -translate-x-1/2"
								initial={false}
								animate={{
									width: `${(completedGateCount / totalGateCount) * 100}%`,
								}}
								transition={{
									duration: 0.4,
								}}
							/>
						</TabsTrigger>
						<TabsTrigger
							value="tasks"
							className="w-full rounded-none relative group border-0 dark:data-[state=active]:text-primary-foreground data-[state=active]:text-foreground text-foreground/80 dark:text-primary-foreground/50 dark:data-[state=active]:bg-primary/30 data-[state=active]:bg-primary/30 shadow-none!"
						>
							<div className="flex items-center gap-1">
								<span>Tasks</span>{" "}
								{completedTasks !== char.tasks.length && (
									<span className="text-xs ">
										({completedTasks}/{char.tasks.length})
									</span>
								)}
								{completedTasks === char.tasks.length && (
									<Check className="inline size-4" />
								)}
							</div>
							<div className="absolute left-0 bottom-0 h-1 w-full z-0 bg-primary/20 group-data-[state=active]:bg-primary/30" />
							<motion.div
								className="absolute left-1/2 bottom-0 z-0 h-1 bg-primary/40 group-data-[state=active]:bg-primary/50 transform -translate-x-1/2"
								initial={false}
								animate={{
									width:
										char.tasks.length === 0
											? "0%"
											: `${(completedTasks / char.tasks.length) * 100}%`,
								}}
								transition={{
									duration: 0.4,
								}}
							/>
						</TabsTrigger>
					</TabsList>
					<Separator />
					<TabsContent value="raids" className="m-0">
						{assignedRaids.length > 0 ? (
							assignedRaids
						) : hasRaidsAssigned ? (
							<CardContent className="p-3 text-center text-muted-foreground">
								Raids completed
							</CardContent>
						) : (
							<CardContent className="p-3 text-center text-muted-foreground">
								No raids assigned
							</CardContent>
						)}
					</TabsContent>
					<TabsContent value="tasks" className="m-0">
						{assignedTasks.length > 0 ? (
							assignedTasks
						) : hasTasksAssigned ? (
							<CardContent className="p-3 text-center text-muted-foreground">
								Tasks completed
							</CardContent>
						) : (
							<CardContent className="p-3 text-center text-muted-foreground">
								No tasks assigned
							</CardContent>
						)}
					</TabsContent>
				</Tabs>
			);
		} else if (mode === "default" && char.tasks.length === 0) {
			if (assignedRaids.length > 0)
				return (
					<>
						<Separator />
						{assignedRaids}
					</>
				);
			else if (hasRaidsAssigned)
				return (
					<>
						<Separator />
						<CardContent className="p-3 text-center text-muted-foreground">
							Raids completed
						</CardContent>
					</>
				);
			else
				return (
					<>
						<Separator />
						<CardContent className="p-3 text-center text-muted-foreground">
							No raids assigned
						</CardContent>
					</>
				);
		}

		if (mode === "raids") {
			if (assignedRaids.length > 0)
				return (
					<>
						<Separator />
						{assignedRaids}
					</>
				);
			else if (hasRaidsAssigned)
				return (
					<>
						<Separator />
						<CardContent className="p-3 text-center text-muted-foreground">
							Raids completed
						</CardContent>
					</>
				);
			else
				return (
					<>
						<Separator />
						<CardContent className="p-3 text-center text-muted-foreground">
							No raids assigned
						</CardContent>
					</>
				);
		}

		if (mode === "tasks") {
			if (assignedTasks.length > 0)
				return (
					<>
						<Separator />
						{assignedTasks}
					</>
				);
			else if (hasTasksAssigned)
				return (
					<>
						<Separator />
						<CardContent className="p-3 text-center text-muted-foreground">
							Tasks completed
						</CardContent>
					</>
				);
			else
				return (
					<>
						<Separator />
						<CardContent className="p-3 text-center text-muted-foreground">
							No tasks assigned
						</CardContent>
					</>
				);
		}
	}, [
		char.tasks,
		mode,
		char.assignedRaids,
		char.id,
		highest3.thisWeek,
		mainStore,
		experimentsStore.state.uiSettings.buttonV2,
		char.isGoldEarner,
		hideCompleted,
	]);

	return (
		<Card className="h-fit w-56 select-none overflow-hidden py-0 gap-0">
			<div className="p-4 flex flex-row gap-2 items-center relative">
				<ClassIcon c={char.class} className="size-10 min-w-10" />
				<div className="flex flex-col w-full">
					<span className="text-xs text-default-500 text-muted-foreground">
						{char.class}
					</span>
					<h2 className="font-bold">{char.name}</h2>
					<div
						className={cn(
							"flex items-center gap-1 text-sm font-semibold text-ctp-yellow"
						)}
					>
						<SwordsIcon className="size-5" />
						{char.itemLevel}
					</div>
				</div>

				{char.isGoldEarner && (
					<PiggyBank
						highest3ThisWeek={highest3.thisWeek}
						highest3NextWeek={highest3.nextWeek}
						char={char}
					/>
				)}
			</div>

			{todoCardContent}
		</Card>
	);
}
