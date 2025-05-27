import PiggyBank from "@/components/PiggyBank";
import ClassIcon from "@/components/class-icons/ClassIcon";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getHighest3, parseGoldInfo, sortRaidKeys } from "@/lib/chars";
import { cn } from "@/lib/utils";
import {
	type Character,
	useMainStore,
	useSettingsStore,
} from "@/providers/MainStoreProvider";
import { Check, SwordsIcon } from "lucide-react";
import { motion } from "motion/react";
import { Fragment, type JSX, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import TodoCardCompleteButton from "./TodoCardCompleteButton";
import TodoCardCompleteButtonV2 from "./TodoCardCompleteButtonV2";
import TodoCardRaid from "./TodoCardRaid";
import TodoCardRaidV2 from "./TodoCardRaidV2";
import TodoCardTask from "./TodoCardTask";

interface Props {
	char: Character;
}

export default function TodoCard({ char }: Props) {
	const mainStore = useMainStore();
	const settingsStore = useSettingsStore();
	const highest3 = useMemo(() => {
		const goldInfo = parseGoldInfo(char.assignedRaids);
		const highest3 = getHighest3(
			char.assignedRaids,
			goldInfo,
			settingsStore.experiments.ignoreThaemineIfNoG4,
		);
		return highest3;
	}, [char, settingsStore.experiments.ignoreThaemineIfNoG4]);

	const assignedRaids = Object.keys(char.assignedRaids)
		.sort(sortRaidKeys)
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
						{settingsStore.experiments.buttonV2 ? (
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

	const filteredTasks = useMemo(() => {
		return {
			daily: char.tasks.filter((t) => t.type === "daily"),
			weekly: char.tasks.filter((t) => t.type === "weekly"),
		};
	}, [char.tasks]);

	const tasks = useMemo(() => {
		return Object.entries(filteredTasks).reduce<{
			daily: JSX.Element[];
			weekly: JSX.Element[];
		}>(
			(acc, [type, tasks]) => {
				if (tasks.length === 0) return acc;

				acc[type as "daily" | "weekly"] = tasks.map((task, i) => (
					<Fragment key={task.id}>
						<CardContent
							key={task.id}
							data-pw={`character-task-${i}`}
							className="p-0"
						>
							<TodoCardTask
								task={task}
								toggleTask={() => mainStore.charToggleTask(char.id, task.id)}
							/>
						</CardContent>
						{i < tasks.length - 1 && <Separator className="opacity-75" />}
					</Fragment>
				));

				return acc;
			},
			{
				daily: [],
				weekly: [],
			},
		);
	}, [char.id, mainStore, filteredTasks]);

	const completedTasks = char.tasks.reduce(
		(acc, t) => (t.completed ? acc + 1 : acc),
		0,
	);

	const completedDailyTasks = filteredTasks.daily.reduce(
		(acc, t) => (t.completed ? acc + 1 : acc),
		0,
	);

	const completedWeeklyTasks = filteredTasks.weekly.reduce(
		(acc, t) => (t.completed ? acc + 1 : acc),
		0,
	);

	const completedRaids = Object.values(char.assignedRaids).reduce((acc, r) => {
		if (Object.values(r).some((b) => !b.completed)) return acc;
		return acc + 1;
	}, 0);

	const completedGateCount = Object.values(char.assignedRaids).reduce(
		(acc, r) => {
			let count = acc;
			for (const gate of Object.values(r)) {
				if (gate.completed) count++;
			}
			return count;
		},
		0,
	);

	const totalGateCount = Object.values(char.assignedRaids).reduce((acc, r) => {
		return acc + Object.values(r).length;
	}, 0);

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
							"flex items-center gap-1 text-sm font-semibold text-yellow",
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
			{char.tasks.length > 0 && (
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
									width: `${((completedWeeklyTasks + completedDailyTasks) / (filteredTasks.daily.length + filteredTasks.weekly.length)) * 100}%`,
								}}
								transition={{
									duration: 0.4,
								}}
							/>
						</TabsTrigger>
					</TabsList>
					<Separator />
					<TabsContent value="raids" className="m-0">
						{assignedRaids}
						{assignedRaids.length === 0 && (
							<CardContent className="p-3 text-center">
								No raids assigned
							</CardContent>
						)}
					</TabsContent>
					<TabsContent value="tasks" className="m-0">
						{tasks.daily.length > 0 && (
							<>
								<CardContent className="p-1 text-center text-sm bg-background/60">
									Daily
								</CardContent>
								<Separator />
								{tasks.daily}
								<Separator />
							</>
						)}
						{tasks.weekly.length > 0 && (
							<>
								<CardContent className="p-1 text-center text-sm bg-background/60">
									Weekly
								</CardContent>
								<Separator />
								{tasks.weekly}
							</>
						)}
						{char.tasks.length === 0 && (
							<CardContent className="p-3 text-center">
								No tasks assigned
							</CardContent>
						)}
					</TabsContent>
				</Tabs>
			)}
			{char.tasks.length === 0 && assignedRaids.length > 0 && (
				<>
					<Separator />
					{assignedRaids}
				</>
			)}
			{char.tasks.length === 0 && assignedRaids.length === 0 && (
				<>
					<Separator />
					<CardContent className="p-3 text-center">
						No raids assigned
					</CardContent>
				</>
			)}
		</Card>
	);
}
