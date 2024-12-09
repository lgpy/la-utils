import { Character, useMainStore } from "@/providers/MainStoreProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useToast } from "../ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2Icon } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  type: z.enum(["daily", "weekly"]),
});

const types = formSchema.shape.type._def.values;

const presets: {
  name: string;
  type: (typeof types)[number];
}[] = [
  {
    name: "Chaos Dungeon",
    type: "daily",
  },
  {
    name: "Guardian Raid",
    type: "daily",
  },
];

interface Props {
  character: Character;
  close: () => void;
  isOpen: boolean;
  taskId?: string;
}

export default function EditCardTaskDialog({
  character,
  isOpen,
  close,
  taskId,
}: Props) {
  const mainStore = useMainStore();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "daily",
    },
  });
  const { toast } = useToast();

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      /*if (taskId !== undefined)
        state.charEditRaid(character.id, taskId, fgates);
      else state.charAddRaid(character.id, values.raidId, fgates);*/
      if (taskId !== undefined)
        mainStore.charEditTask(character.id, taskId, {
          name: values.name,
          type: values.type,
        });
      else
        mainStore.charAddTask(character.id, {
          name: values.name,
          type: values.type,
        });

      close();
      toast({
        title: `Task ${taskId ? "Updated" : "Added"}!`,
        description: `Raid has been ${
          taskId ? "updated" : "added"
        } successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error!",
        description: `Failed to ${taskId ? "update" : "add"} task!`,
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    const task = character.tasks.find((t) => t.id === taskId);
    form.reset({
      name: task?.name || "",
      type: task?.type || "daily",
    });
  }, [isOpen, taskId, character.tasks, form]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-primary">
            {taskId ? "Update Task" : "Add Task"} - {character.name}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="task-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your task's name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the task type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <div className="mr-auto flex flex-row justify-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Presets</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {presets.map((preset, idx) => (
                  <DropdownMenuItem
                    key={"preset" + idx}
                    onClick={() => {
                      form.setValue("name", preset.name);
                      form.setValue("type", preset.type);
                    }}
                  >
                    {preset.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {taskId !== undefined && (
              <Button
                variant="destructive"
                onClick={() => {
                  mainStore.charDelTask(character.id, taskId);
                  close();
                }}
                size="icon"
                data-pw="char-delete-button"
              >
                <Trash2Icon />
              </Button>
            )}
          </div>
          <Button variant="ghost" onClick={close} data-pw="form-cancel">
            Cancel
          </Button>
          <Button type="submit" form="task-form" data-pw="form-submit">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
