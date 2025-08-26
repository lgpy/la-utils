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
import { useMainStore } from "@/stores/main-store/provider";
import { MainState } from "@/stores/main-store/main-store";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function BackupCards() {
	const mainStore = useMainStore();
	const [jsonImport, setJsonImport] = useState("");

	const importData = () => {
		try {
			const data = JSON.parse(jsonImport);
			mainStore.restoreData(data);
			toast.success("Data imported successfully.");
		} catch {
			toast.error("Failed to import data. Make sure the data is correct.");
		}
		setJsonImport("");
	};

	const mainStoreState: string = useMemo(() => {
		const state: MainState = {
			characters: mainStore.characters,
			tasks: mainStore.tasks,
		};
		return JSON.stringify(state, null, 2);
	}, [mainStore]);

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
						value={mainStoreState}
						onChange={() => {}}
						className="h-80 break-all"
					/>
				</CardContent>
				<CardFooter className="flex justify-end">
					<CopyButton textToCopy={mainStoreState}>Copy</CopyButton>
				</CardFooter>
			</Card>
		</>
	);
}
