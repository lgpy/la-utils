"use client";

import CopyButton from "@/components/CopyButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useMainStore } from "@/providers/MainStoreProvider";
import { useState } from "react";

export default function BackupCards() {
  const mainStore = useMainStore();
  const [jsonImport, setJsonImport] = useState("");
  const { toast } = useToast();

  const importData = () => {
    try {
      const data = JSON.parse(jsonImport);
      mainStore.restoreData(data);
      toast({
        title: "Success!",
        description: `Data imported successfully.`,
      });
    } catch (e) {
      toast({
        title: "Error!",
        description: `Failed to import data. Make sure the data is correct.`,
        variant: "destructive",
      });
    }
    setJsonImport("");
  };

  return (
    <>
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Import data</CardTitle>
          <CardDescription>
            Import data from a previous export. This will overwrite any existing
            data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste your export here."
            value={jsonImport}
            onChange={(e) => setJsonImport(e.target.value)}
            className="min-h-60"
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={() => importData()}>Import</Button>
        </CardFooter>
      </Card>
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Exported data</CardTitle>
          <CardDescription>
            Exported data can be imported later to restore your data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={JSON.stringify(mainStore)}
            onChange={() => {}}
            className="min-h-60"
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <CopyButton textToCopy={JSON.stringify(mainStore)}>Copy</CopyButton>
        </CardFooter>
      </Card>
    </>
  );
}
