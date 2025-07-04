"use client";
import {
	Database,
	FlaskConical,
	Import,
	ListTodoIcon,
	LogIn,
	LogOut,
	Moon,
	SettingsIcon,
	Sun,
	SunMoon,
	User,
	Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { useSettingsStore } from "@/providers/MainStoreProvider";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth";
import RaidUploadManagerDialog from "./RaidUploadManagerDialog";
import { useState } from "react";

export default function SettingsButton() {
	const { setTheme, theme } = useTheme();
	const settingsStore = useSettingsStore();
	const router = useRouter();

	const { data: session, isPending, error, refetch } = authClient.useSession();

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
				<DropdownMenuTrigger asChild disabled={!settingsStore.hasHydrated}>
					<Button variant="outline" size="icon">
						<SettingsIcon />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56 hover:">
					<DropdownMenuLabel>Settings</DropdownMenuLabel>
					<DropdownMenuSeparator />

					{session ? (
						<DropdownMenuGroup>
							<DropdownMenuSub>
								<DropdownMenuSubTrigger>
									<User />
									<span>Logged in as {session.user?.name}</span>
								</DropdownMenuSubTrigger>
								<DropdownMenuPortal>
									<DropdownMenuSubContent>
										<DropdownMenuItem onClick={() => router.push("/friends")}>
											<Users />
											<span>Friends</span>
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setRaidUploadManagerOpen(true)}>
											<ListTodoIcon />
											<span>Manage shared raids</span>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() => {
												authClient.signOut();
												refetch();
											}}
										>
											<LogOut />
											<span>Logout</span>
										</DropdownMenuItem>
									</DropdownMenuSubContent>
								</DropdownMenuPortal>
							</DropdownMenuSub>
						</DropdownMenuGroup>
					) : (
						<DropdownMenuItem
							disabled={isPending || error !== null}
							onClick={() =>
								!isPending &&
								authClient.signIn.social({
									provider: "discord",
								})
							}
						>
							<LogIn />
							<span>
								{isPending
									? "Logging in..."
									: error
										? "Login Failed"
										: "Login with Discord"}
							</span>
						</DropdownMenuItem>
					)}

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
										checked={settingsStore.experiments.buttonV2}
										onCheckedChange={() =>
											settingsStore.toggleExperiments(
												"buttonV2",
												!settingsStore.experiments.buttonV2,
											)
										}
									>
										<span>Raid Button V2</span>
									</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem
										checked={settingsStore.experiments.ignoreThaemineIfNoG4}
										onCheckedChange={() =>
											settingsStore.toggleExperiments(
												"ignoreThaemineIfNoG4",
												!settingsStore.experiments.ignoreThaemineIfNoG4,
											)
										}
									>
										<span>Ignore Thaemine if no G4</span>
									</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem
										checked={settingsStore.experiments.compactRaidCard}
										onCheckedChange={() =>
											settingsStore.toggleExperiments(
												"compactRaidCard",
												!settingsStore.experiments.compactRaidCard,
											)
										}
									>
										<span>Compact Raid Card</span>
									</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem
										checked={settingsStore.experiments.autoUpdateRaids}
										onCheckedChange={() =>
											settingsStore.toggleExperiments(
												"autoUpdateRaids",
												!settingsStore.experiments.autoUpdateRaids,
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
