import { Character, useMainStore } from "@/hooks/mainstore";
import { getHighest3, parseGoldInfo, sortRaidKeys } from "@/lib/chars";
import { cn } from "@/lib/utils";
import { SwordsIcon } from "lucide-react";
import { Fragment, useMemo } from "react";
import ClassIcon from "@/components/class-icons/ClassIcon";
import PiggyBank from "@/components/PiggyBank";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import TodoCardRaid from "./TodoCardRaid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import TodoCardTask from "./TodoCardTask";
import { date } from "zod";

interface Props {
  char: Character;
  isGoldEarner: boolean;
}

export default function TodoCard({ char, isGoldEarner }: Props) {
  const { state } = useMainStore();
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
          <TodoCardRaid
            charId={char.id}
            raidId={raidId}
            raid={char.assignedRaids[raidId]}
            goldEarner={
              isGoldEarner &&
              highest3[raidId] !== undefined &&
              Object.keys(highest3).length <
                Object.keys(char.assignedRaids).length
            }
          />
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

        {isGoldEarner && <PiggyBank goldInfo={highest3} />}
      </CardHeader>
      <Tabs defaultValue="raids">
        <TabsList className="w-full bg-background/30 p-0 h-auto rounded-none">
          <TabsTrigger value="raids" className="w-full rounded-none">
            <p>
              Raids{" "}
              <span className="text-xs text-muted-foreground">
                ({Object.keys(char.assignedRaids).length})
              </span>
            </p>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="w-full rounded-none">
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
    </Card>
  );
}
