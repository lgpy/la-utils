import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { MoveIcon, PencilIcon, PlusIcon, SwordsIcon } from "lucide-react";
import { Fragment, JSX, useMemo } from "react";
import ClassIcon from "@/components/class-icons/ClassIcon";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CharacterCardAssignedRaid from "./EditCardAssignedRaid";
import { sortRaidKeys } from "@/lib/chars";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditCardTask from "./EditCardTask";
import { Character } from "@/providers/MainStoreProvider";

type Props = {
  char: Character;
  editCharacter: () => void;
  openRaidDialog: (raidId?: string) => void;
  openTaskDialog: (taskId?: string) => void;
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
              <EditCardTask
                task={task}
                openTaskDialog={() => openTaskDialog(task.id)}
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
  }, [char.tasks, openTaskDialog]);

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
              "flex items-center gap-1 text-sm font-semibold dark:text-[#eed49f] text-[#df8e1d]",
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
          data-pw={`edit-character`}
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
      </div>
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
              data-pw={`character-add-raid`}
            >
              <PlusIcon className="mr-1 h-4 w-4" /> Add Raid
            </Button>
          </CardContent>
        </TabsContent>
        <TabsContent value="tasks" className="m-0">
          <div ref={parent2}>
            {tasks.daily.length > 0 && (
              <>
                <CardContent className="p-1 text-center text-sm bg-background/60">
                  Daily
                </CardContent>
                <Separator />
                {tasks.daily}
              </>
            )}
            {tasks.weekly.length > 0 && tasks.daily.length > 0 && <Separator />}
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
          </div>
          <Separator />
          <CardContent className="p-0">
            <Button
              className="w-full rounded-t-none px-0"
              onClick={() => openTaskDialog()}
              variant="ghost"
              data-pw={`character-add-task`}
            >
              <PlusIcon className="mr-1 h-4 w-4" /> Add Task
            </Button>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
