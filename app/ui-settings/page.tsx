"use client";

import TodoCardCompleteButton from "@/components/TodoCard/TodoCardCompleteButton";
import TodoCardCompleteButtonV2 from "@/components/TodoCard/TodoCardCompleteButtonV2";
import TodoCardRaidV2 from "@/components/TodoCard/TodoCardRaidV2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Difficulty } from "@/generated/prisma";

import { useSettingsStore } from "@/stores/main-store/provider";

const raidData: {
	raidId: string;
	gates: {
		[key: string]: {
			difficulty: Difficulty;
			completed: boolean;
		};
	};
} = {
	raidId: "mordum",
	gates: {
		G1: {
			difficulty: "Hard",
			completed: true,
		},
		G2: {
			difficulty: "Hard",
			completed: false,
		},
		G3: {
			difficulty: "Hard",
			completed: false,
		},
	},
};

interface UiChoicesProps {
	title: string;
	option1: {
		selected: boolean;
		onSelect: () => void;
		children: React.ReactNode;
	};
	option2: {
		selected: boolean;
		onSelect: () => void;
		children: React.ReactNode;
	};
}

function UiChoices({ title, option1, option2 }: UiChoicesProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent className="grid grid-cols-2 gap-4">
				<Label className="hover:bg-input/30 hover:cursor-pointer flex items-center gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-primary bg-input/20">
					<Checkbox
						className="self-start"
						checked={option1.selected}
						onCheckedChange={option1.onSelect}
					/>
					{option1.children}
				</Label>
				<Label className="hover:bg-input/30 hover:cursor-pointer flex items-center gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-primary bg-input/20">
					<Checkbox
						className="self-start"
						checked={option2.selected}
						onCheckedChange={option2.onSelect}
					/>
					{option2.children}
				</Label>
			</CardContent>
		</Card>
	);
}

export default function UiSettingsPage() {
	const settingsStore = useSettingsStore((store) => store);

	if (!settingsStore.hasHydrated) return null;

	return (
		<div className="container mx-auto py-6 space-y-6">
			<div>
				<h1 className="text-3xl font-bold">User Interface Settings</h1>
				<p className="text-muted-foreground mt-2">
					Customize the user interface settings for your application.
				</p>
			</div>
			<div className="grid grid-cols-1 xl:grid-cols-2 w-full gap-4">
				<UiChoices
					title="Raid Complete Button"
					option1={{
						selected: !settingsStore.state.uiSettings.buttonV2,
						onSelect: () =>
							settingsStore.state.toggleUiSettings("buttonV2", false),
						children: (
							<div className="border-border border-1 w-full">
								<TodoCardRaidV2
									raidId={raidData.raidId}
									raid={raidData.gates}
									goldEarner={true}
								>
									<TodoCardCompleteButton
										raidId={raidData.raidId}
										assignedGates={raidData.gates}
										charId={"s"}
										disableInput={true}
									/>
								</TodoCardRaidV2>
							</div>
						),
					}}
					option2={{
						selected: settingsStore.state.uiSettings.buttonV2,
						onSelect: () =>
							settingsStore.state.toggleUiSettings("buttonV2", true),
						children: (
							<div className="border-border border-1 w-full">
								<TodoCardRaidV2
									raidId={raidData.raidId}
									raid={raidData.gates}
									goldEarner={true}
								>
									<TodoCardCompleteButtonV2
										raidId={raidData.raidId}
										assignedGates={raidData.gates}
										charId={"s"}
										disableInput={true}
									/>
								</TodoCardRaidV2>
							</div>
						),
					}}
				/>

				<UiChoices
					title="Hide difficulty from raids"
					option1={{
						selected: !settingsStore.state.uiSettings.compactRaidCard,
						onSelect: () =>
							settingsStore.state.toggleUiSettings("compactRaidCard", false),
						children: (
							<div className="border-border border-1 w-full">
								<TodoCardRaidV2
									raidId={raidData.raidId}
									raid={raidData.gates}
									goldEarner={true}
									forceCompact={false}
								>
									{settingsStore.state.uiSettings.buttonV2 ? (
										<TodoCardCompleteButtonV2
											raidId={raidData.raidId}
											assignedGates={raidData.gates}
											charId={"s"}
											disableInput={true}
										/>
									) : (
										<TodoCardCompleteButton
											raidId={raidData.raidId}
											assignedGates={raidData.gates}
											charId={"s"}
											disableInput={true}
										/>
									)}
								</TodoCardRaidV2>
							</div>
						),
					}}
					option2={{
						selected: settingsStore.state.uiSettings.compactRaidCard,
						onSelect: () =>
							settingsStore.state.toggleUiSettings("compactRaidCard", true),
						children: (
							<div className="border-border border-1 w-full">
								<TodoCardRaidV2
									raidId={raidData.raidId}
									raid={raidData.gates}
									goldEarner={true}
									forceCompact={true}
								>
									{settingsStore.state.uiSettings.buttonV2 ? (
										<TodoCardCompleteButtonV2
											raidId={raidData.raidId}
											assignedGates={raidData.gates}
											charId={"s"}
											disableInput={true}
										/>
									) : (
										<TodoCardCompleteButton
											raidId={raidData.raidId}
											assignedGates={raidData.gates}
											charId={"s"}
											disableInput={true}
										/>
									)}
								</TodoCardRaidV2>
							</div>
						),
					}}
				/>

				<UiChoices
					title="Toggle for switching between Tasks and Raids"
					option1={{
						selected: !settingsStore.state.uiSettings.separateTasks,
						onSelect: () =>
							settingsStore.state.toggleUiSettings("separateTasks", false),
						children: (
							<div className="grid gap-1.5 font-normal">
								<p className="text-sm leading-none font-medium">Single</p>
								<p className="text-muted-foreground text-sm">
									Switch between Raids and Tasks on a per-character basis
								</p>
							</div>
						),
					}}
					option2={{
						selected: settingsStore.state.uiSettings.separateTasks,
						onSelect: () =>
							settingsStore.state.toggleUiSettings("separateTasks", true),
						children: (
							<div className="grid gap-1.5 font-normal">
								<p className="text-sm leading-none font-medium">Group</p>
								<p className="text-muted-foreground text-sm">
									Switch between Raids and Tasks for all characters
								</p>
							</div>
						),
					}}
				/>
			</div>
		</div>
	);
}
