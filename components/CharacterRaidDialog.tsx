import { Class } from "@/lib/classes";
import { useCharactersStore } from "@/providers/CharactersStoreProvider";
import { Character } from "@/stores/character";
import { Fragment, use, useEffect, useMemo } from "react";
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
import { Difficulty, getRaidsFilteredByIlvl, raids } from "@/lib/raids";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

Difficulty;
const formSchema = z.object({
  raidId: z.string().min(2).max(50),
  gates: z.array(z.nativeEnum(Difficulty).or(z.literal("none"))),
});

interface Props {
  character: Character;
  close: () => void;
  isOpen: boolean;
  raidId?: string;
}

export default function CharacterRaidDialog({
  character,
  isOpen,
  close,
  raidId,
}: Props) {
  const characters = useCharactersStore((store) => store);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      raidId: raidId || "",
      gates: [],
    },
  });
  const { toast } = useToast();

  const filteredRaids = useMemo(() => {
    const ilvlfitered = getRaidsFilteredByIlvl(character.itemLevel);
    const existingfiltered = ilvlfitered.filter((raid) => {
      return raid.id === raidId || !character.raids[raid.id];
    });
    return existingfiltered;
  }, [character.itemLevel, raidId, character.raids]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const raid = raids.find((raid) => raid.id === values.raidId);
      if (!raid) throw new Error("Raid not found!");

      const gates = values.gates
        .filter((d) => d !== "none")
        .map((gate, index) => ({
          id: Object.keys(raid.gates)[index],
          difficulty: gate,
        }));

      if (raidId !== undefined)
        characters.updateRaidInCharacter(character.id, {
          id: values.raidId,
          gates,
        });
      else
        characters.addRaidToCharacter(character.id, {
          id: values.raidId,
          gates,
        });

      close();
      toast({
        title: `Raid ${raidId ? "Updated" : "Added"}!`,
        description: `Raid has been ${
          raidId ? "updated" : "added"
        } successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error!",
        description: `Failed to ${raidId ? "update" : "add"} raid!`,
        variant: "destructive",
      });
    }
  }

  const watchRaidId = form.watch("raidId");
  const actualRaid = useMemo(() => {
    return raids.find((raid) => raid.id === watchRaidId);
  }, [watchRaidId]);

  const checkBoxGroups = useMemo(() => {
    if (!actualRaid) return [];
    return Object.entries(actualRaid.gates).map(([gateId, gate], gateIndex) => {
      const checkBoxes = actualRaid.difficulties.map(
        (difficulty, diffIndex) => {
          if (gate.itemlevel[diffIndex] === null) return null;
          if (gate.itemlevel[diffIndex] > character.itemLevel) return null;
          return (
            <FormItem
              className="flex items-center space-x-3 space-y-0"
              key={"rgi" + gateId + difficulty}
            >
              <FormControl>
                <RadioGroupItem value={difficulty} />
              </FormControl>
              <FormLabel className="font-normal">{difficulty}</FormLabel>
            </FormItem>
          );
        },
      );
      return (
        <FormField
          key={"rg" + gateId}
          control={form.control}
          name={`gates.${gateIndex}`}
          render={({ field }) => (
            <FormItem className="flex flex-row">
              <FormLabel className="w-6">{gateId}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-row justify-around w-full !mt-0 gap-2"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="none" />
                    </FormControl>
                    <FormLabel className="font-normal">None</FormLabel>
                  </FormItem>
                  {checkBoxes}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    });
  }, [actualRaid, character.itemLevel, form.control]);

  useEffect(() => {
    if (!isOpen) return;
    form.reset({
      raidId: actualRaid ? actualRaid.id : "",
      gates: actualRaid
        ? Object.keys(actualRaid.gates).map(
            (gateId) =>
              character.raids[actualRaid.id]?.gates.find((g) => g.id === gateId)
                ?.difficulty || "none",
          )
        : [],
    });
  }, [actualRaid, isOpen, character.raids, form]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-primary">
            {raidId ? "Update Raid" : "Add Raid"} - {character.name}
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
              name="raidId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={raidId !== undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the raid" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredRaids.map((raid) => (
                        <SelectItem key={raid.id} value={raid.id}>
                          {raid.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <FormLabel>Gates</FormLabel>
            </div>
            {checkBoxGroups}
          </form>
        </Form>
        <DialogFooter>
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
