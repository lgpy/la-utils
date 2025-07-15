"use client";
import {
	Database,
	FlaskConical,
	Import,
	ListTodoIcon,
	LoaderCircleIcon,
	LogIn,
	LogOut,
	Moon,
	SettingsIcon,
	Sun,
	SunMoon,
	Users,
} from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettingsStore } from "@/stores/main-store/provider";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth";
import RaidUploadManagerDialog from "./RaidUploadManagerDialog";
import { useState } from "react";
import { showAlert } from "./AlertDialog.hooks";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";

export default function SettingsButton() {
	const { setTheme, theme } = useTheme();
	const settingsStore = useSettingsStore((store) => store);
	const router = useRouter();

	const session = authClient.useSession();

	const [isRaidUploadManagerOpen, setRaidUploadManagerOpen] = useState(false);

	const ThemeIcon = (() => {
		switch (theme) {
			case "light":
				return <Sun />;
			case "dark":
				return <Moon />;
			case "system":
				return <SunMoon />;
			default:
				return <SunMoon />;
		}
	})();

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button disabled={!settingsStore.hasHydrated} className={
						cn("flex flex-row gap-2 items-center hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 rounded-base outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]", {
							"pr-2": session.data,
							"px-2": !session.data,
						})
					}>
						{session.isPending ? (
							<>
								<LoaderCircleIcon className="animate-spin" />
							</>
						) : session.data ? (
							<>
								<Avatar className="size-9 rounded-lg">
									<AvatarImage src={session.data.user.image ?? undefined} alt={session.data.user.name} />
									<AvatarFallback className="rounded-lg">CN</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{session.data.user.name}</span>
								</div>
								<SettingsIcon className="size-4" />
							</>
						) : (
							<>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">Guest</span>
								</div>
								<SettingsIcon className="size-4" />
							</>
						)}
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56 hover:" side="bottom" align="end">
					<DropdownMenuLabel>Local Settings</DropdownMenuLabel>
					<DropdownMenuItem onClick={() => router.push("/backup")}>
						<Import />
						<span>Import/Export Data</span>
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => router.push("/loa-logs-config")}>
						<Database />
						<span>LOA Logs Configuration</span>
					</DropdownMenuItem>
					<DropdownMenuGroup>
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>
								{ThemeIcon}
								<span>Theme</span>
							</DropdownMenuSubTrigger>
							<DropdownMenuPortal>
								<DropdownMenuSubContent>
									<DropdownMenuCheckboxItem
										checked={theme === "light"}
										onCheckedChange={() => setTheme("light")}
									>
										<Sun />
										<span>Light</span>
									</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem
										checked={theme === "dark"}
										onCheckedChange={() => setTheme("dark")}
									>
										<Moon />
										<span>Dark</span>
									</DropdownMenuCheckboxItem>
									<DropdownMenuSeparator />
									<DropdownMenuCheckboxItem
										checked={theme === "system"}
										onCheckedChange={() => setTheme("system")}
									>
										<SunMoon />
										<span>System</span>
									</DropdownMenuCheckboxItem>
								</DropdownMenuSubContent>
							</DropdownMenuPortal>
						</DropdownMenuSub>
					</DropdownMenuGroup>
					<DropdownMenuGroup>
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>
								<FlaskConical />
								<span>Experiments</span>
							</DropdownMenuSubTrigger>
							<DropdownMenuPortal>
								<DropdownMenuSubContent>
									<DropdownMenuCheckboxItem
										checked={settingsStore.state.experiments.buttonV2}
										onCheckedChange={() =>
											settingsStore.state.toggleExperiments(
												"buttonV2",
												!settingsStore.state.experiments.buttonV2,
											)
										}
									>
										<span>Raid Button V2</span>
									</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem
										checked={settingsStore.state.experiments.ignoreThaemineIfNoG4}
										onCheckedChange={() =>
											settingsStore.state.toggleExperiments(
												"ignoreThaemineIfNoG4",
												!settingsStore.state.experiments.ignoreThaemineIfNoG4,
											)
										}
									>
										<span>Ignore Thaemine if no G4</span>
									</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem
										checked={settingsStore.state.experiments.compactRaidCard}
										onCheckedChange={() =>
											settingsStore.state.toggleExperiments(
												"compactRaidCard",
												!settingsStore.state.experiments.compactRaidCard,
											)
										}
									>
										<span>Compact Raid Card</span>
									</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem
										checked={settingsStore.state.experiments.autoUpdateRaids}
										onCheckedChange={() =>
											settingsStore.state.toggleExperiments(
												"autoUpdateRaids",
												!settingsStore.state.experiments.autoUpdateRaids,
											)
										}
									>
										<span>Auto Update Raids</span>
									</DropdownMenuCheckboxItem>
								</DropdownMenuSubContent>
							</DropdownMenuPortal>
						</DropdownMenuSub>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuLabel>My Account</DropdownMenuLabel>

					{session.data ? (
						<>
							<DropdownMenuItem onClick={() => router.push("/friends")}>
								<Users />
								<span>Friends</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setRaidUploadManagerOpen(true)}>
								<ListTodoIcon />
								<span>Manage shared raids</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={async () => {
									try {
										const decision = await showAlert({
											title: "Logout",
											description: "Are you sure you want to logout?",
											confirmButton: {
												text: "Logout",
											},
											cancelButton: {
												text: "Cancel",
											},
										})
										if (decision) {
											authClient.signOut();
											session.refetch();
										}
									} catch (error) {
										console.error("Error showing alert:", error);
									}
								}}
							>
								<LogOut />
								<span>Logout</span>
							</DropdownMenuItem>
						</>
					) : (
						<DropdownMenuItem
							disabled={session.isPending || session.error !== null}
							onClick={() =>
								!session.isPending &&
								authClient.signIn.social({
									provider: "discord",
								})
							}
						>
							<LogIn />
							<span>
								{session.isPending
									? "Logging in..."
									: session.error
										? "Login Failed"
										: "Login with Discord"}
							</span>
						</DropdownMenuItem>
					)}

					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => window.open("https://ko-fi.com/leo213", "_blank")}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="currentColor"
							viewBox="0 0 24 24"
							role="img"
							aria-hidden="true"
						>
							<path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z" />
						</svg>
						<span>Support on Ko-fi</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<RaidUploadManagerDialog
				open={isRaidUploadManagerOpen}
				onOpenChange={setRaidUploadManagerOpen}
			/>
		</>
	);
}
