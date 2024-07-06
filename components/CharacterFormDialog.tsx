interface Props {
  isOpen: boolean;
  close: () => void;
  existingCharacter?: Character;
}

import { Class } from "@/lib/classes";
import { useCharactersStore } from "@/providers/CharactersStoreProvider";
import { Character } from "@/stores/character";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTitle,
} from "./ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "./ui/form";
import { useToast } from "./ui/use-toast";
import { ToastAction } from "./ui/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import Link from "next/link";
import { Trash2Icon, TrashIcon } from "lucide-react";
import getClassIcon from "./class-icons/factory";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  itemLevel: z.number().int().min(0).max(9999),
  class: z.nativeEnum(Class),
});

const classes = Object.values(Class);

export default function CharacterFormDialog({
  isOpen,
  close,
  existingCharacter,
}: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      class: undefined,
      itemLevel: undefined,
      name: "",
    },
  });
  const characters = useCharactersStore((store) => store);
  const { toast } = useToast();

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (existingCharacter !== undefined)
        characters.updateCharacter(existingCharacter.id, values);
      else characters.createCharacter(values);
      close();
      toast({
        title: `Character ${existingCharacter ? "Updated" : "Created"}!`,
        description: `Your character has been ${
          existingCharacter ? "updated" : "created"
        } successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error!",
        description: `Failed to ${
          existingCharacter ? "update" : "create"
        } character!`,
        variant: "destructive",
      });
    }
  }

  const deleteCharacter = () => {
    if (!existingCharacter) return;
    if (!window.confirm("Are you sure you want to delete this character?"))
      return;
    characters.deleteCharacter(existingCharacter.id);
    close();
    toast({
      title: "Character Deleted!",
      description: "Your character has been deleted successfully!",
      action: (
        <ToastAction
          onClick={() => characters.createCharacter(existingCharacter)}
          className="hover:text-background"
          altText="Undo"
        >
          Undo
        </ToastAction>
      ),
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    form.reset({
      name: existingCharacter?.name ?? "",
      itemLevel: existingCharacter?.itemLevel,
      class: existingCharacter?.class,
    });
  }, [existingCharacter, form.reset, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-primary">
            {existingCharacter ? "Update Character" : "Create Character"}
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your character's name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Your character's class..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classes
                        .sort((a, b) => a.localeCompare(b))
                        .map((c) => (
                          <SelectItem
                            key={c}
                            value={c}
                            className="flex items-center"
                          >
                            <div className="flex items-center gap-2">
                              {getClassIcon(c, { size: 24 })}
                              {c}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="itemLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item level</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your character's item level..."
                      type="number"
                      {...field}
                      onChange={(event) => field.onChange(+event.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          {existingCharacter && (
            <Button
              variant="destructive"
              onClick={deleteCharacter}
              disabled={!existingCharacter}
              size="icon"
              className=" mr-auto"
            >
              <Trash2Icon />
            </Button>
          )}
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form="char-form">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
