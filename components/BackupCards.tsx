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
import { useMainStore } from "@/providers/MainStoreProvider";
import { useState } from "react";
import { toast } from "sonner";

export default function BackupCards() {
	const mainStore = useMainStore();
	const [jsonImport, setJsonImport] = useState("");

	const importData = () => {
		try {
			const data = JSON.parse(jsonImport);
			mainStore.restoreData(data);
			toast.success("Data imported successfully.");
		} catch (e) {
			toast.error("Failed to import data. Make sure the data is correct.");
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
						className="h-80 break-all"
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
						value={JSON.stringify(mainStore, null, 2)}
						onChange={() => {}}
						className="h-80 break-all"
					/>
				</CardContent>
				<CardFooter className="flex justify-end">
					<CopyButton textToCopy={JSON.stringify(mainStore)}>Copy</CopyButton>
				</CardFooter>
			</Card>
		</>
	);
}
