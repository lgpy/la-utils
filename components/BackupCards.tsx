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
import { _useMainStore } from "@/providers/MainStoreProvider";
import { useState } from "react";

export default function BackupCards() {
  const { store } = _useMainStore((state) => state);
  const [jsonImport, setJsonImport] = useState("");
  const { toast } = useToast();

  const importData = () => {
    try {
      const data = JSON.parse(jsonImport);
      store.restoreData(data);
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
      <Card className="w-[350px]">
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
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={() => importData()}>Import</Button>
        </CardFooter>
      </Card>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Exported data</CardTitle>
          <CardDescription>
            Exported data can be imported later to restore your data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea value={JSON.stringify(store)} onChange={() => {}} />
        </CardContent>
        <CardFooter className="flex justify-end">
          <CopyButton textToCopy={JSON.stringify(store)}>Copy</CopyButton>
        </CardFooter>
      </Card>
    </>
  );
}
