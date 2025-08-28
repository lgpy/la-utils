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
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function BackupCards() {
	const mainStore = useMainStore();
	const [jsonImport, setJsonImport] = useState("");
	const [backupData, setBackupData] = useState("");

	const importData = () => {
		try {
			const data = JSON.parse(jsonImport);
			if (window === undefined) return;
			localStorage.setItem("characters", JSON.stringify(data));
			mainStore.rehydrate();
			toast.success("Data imported successfully.");
		} catch {
			toast.error("Failed to import data. Make sure the data is correct.");
		}
		setJsonImport("");
	};

	useEffect(() => {
		if (window === undefined) return;
		const state = localStorage.getItem("characters");
		if (state) setBackupData(JSON.stringify(JSON.parse(state), null, 2));
		else setBackupData("Failed to retrieve data.");
	}, []);

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
						value={backupData}
						onChange={() => {}}
						className="h-80 break-all"
					/>
				</CardContent>
				<CardFooter className="flex justify-end">
					<CopyButton textToCopy={backupData}>Copy</CopyButton>
				</CardFooter>
			</Card>
		</>
	);
}
