import { Character, useMainStore } from "@/hooks/mainstore";
import { getHighest3, parseGoldInfo, sortRaidKeys } from "@/lib/chars";
import { cn } from "@/lib/utils";
import { Check, SwordsIcon } from "lucide-react";
import { Fragment, JSX, useMemo } from "react";
import ClassIcon from "@/components/class-icons/ClassIcon";
import PiggyBank from "@/components/PiggyBank";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import TodoCardRaid from "./TodoCardRaid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import TodoCardTask from "./TodoCardTask";
import TodoCardRaidV2 from "./TodoCardRaidV2";
import { useSettingsStore } from "@/providers/SettingsProvider";
import { motion } from "framer-motion";

interface Props {
  char: Character;
}

export default function TodoCard({ char }: Props) {
  const { state } = useMainStore();
  const settings = useSettingsStore((s) => s);
  const highest3 = useMemo(() => {
    const goldInfo = parseGoldInfo(char.assignedRaids);
    const highest3 = getHighest3(goldInfo);
    return highest3;
  }, [char]);

  const assignedRaids = Object.keys(char.assignedRaids)
    .sort(sortRaidKeys)
    .map((raidId, i, keys) => (
      <Fragment key={char.id + raidId}>
        <CardContent
          className={cn("transition p-0", {
            "rounded-b-lg": i === keys.length - 1,
          })}
        >
          {settings.store.experiments.buttonV2 ? (
            <TodoCardRaidV2
              charId={char.id}
              raidId={raidId}
              raid={char.assignedRaids[raidId]}
              goldEarner={
                char.isGoldEarner &&
                highest3[raidId] !== undefined &&
                Object.keys(highest3).length <
                  Object.keys(char.assignedRaids).length
              }
            />
          ) : (
            <TodoCardRaid
              charId={char.id}
              raidId={raidId}
              raid={char.assignedRaids[raidId]}
              goldEarner={
                char.isGoldEarner &&
                highest3[raidId] !== undefined &&
                Object.keys(highest3).length <
                  Object.keys(char.assignedRaids).length
              }
            />
          )}
        </CardContent>
        {i < keys.length - 1 && <Separator className="opacity-75" />}
      </Fragment>
    ));

  const tasks = useMemo(() => {
    const filteredTasks = {
      daily: char.tasks.filter((t) => t.type === "daily"),
      weekly: char.tasks.filter((t) => t.type === "weekly"),
    };

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
                toggleTask={() => state.charToggleTask(char.id, task.id)}
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
  }, [char.tasks, char.id, state]);

  const completedTasks = char.tasks.reduce(
    (acc, t) => (t.completed ? acc + 1 : acc),
    0,
  );
  const completedRaids = Object.values(char.assignedRaids).reduce((acc, r) => {
    if (Object.values(r).some((b) => !b.completed)) return acc;
    return acc + 1;
  }, 0);

  const completedGateCount = Object.values(char.assignedRaids).reduce(
    (acc, r) => {
      Object.values(r).forEach((b) => {
        if (b.completed) acc++;
      });
      return acc;
    },
    0,
  );

  const totalGateCount = Object.values(char.assignedRaids).reduce((acc, r) => {
    return acc + Object.values(r).length;
  }, 0);

  return (
    <Card className="h-fit w-56 border-card border-1 select-none overflow-hidden">
      <CardHeader className="p-4 flex flex-row gap-2 items-center relative">
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

        {char.isGoldEarner && <PiggyBank goldInfo={highest3} />}
      </CardHeader>
      {char.tasks.length > 0 && (
        <Tabs defaultValue="raids">
          <TabsList className="w-full bg-background/30 p-0 h-auto rounded-none">
            <TabsTrigger
              value="raids"
              className="w-full rounded-none relative group"
            >
              <p>
                <span className="group-data-[state=active]:underline">
                  Raids
                </span>{" "}
                {completedRaids !== Object.keys(char.assignedRaids).length && (
                  <span className="text-xs text-muted-foreground">
                    ({completedRaids}/{Object.keys(char.assignedRaids).length})
                  </span>
                )}
                {completedRaids === Object.keys(char.assignedRaids).length && (
                  <Check className="inline size-4" />
                )}
              </p>
              <motion.div
                className="absolute left-0 right-0 top-0 z-0 h-full bg-primary/10"
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
              className="w-full rounded-none relative group"
            >
              <p>
                <span className="group-data-[state=active]:underline">
                  Tasks
                </span>{" "}
                {completedTasks !== char.tasks.length && (
                  <span className="text-xs text-muted-foreground">
                    ({completedTasks}/{char.tasks.length})
                  </span>
                )}
                {completedTasks === char.tasks.length && (
                  <Check className="inline size-4" />
                )}
              </p>
              <motion.div
                className="absolute left-0 right-0 top-0 z-0 h-full bg-primary/10"
                initial={false}
                animate={{
                  width: `${(completedTasks / char.tasks.length) * 100}%`,
                }}
                transition={{
                  duration: 0.4,
                }}
              ></motion.div>
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
