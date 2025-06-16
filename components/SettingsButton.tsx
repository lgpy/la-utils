"use client";
import {
	Database,
	FlaskConical,
	Import,
	LogIn,
	LogOut,
	Moon,
	Server,
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

export default function SettingsButton() {
	const { setTheme, theme } = useTheme();
	const settingsStore = useSettingsStore();
	const router = useRouter();

	const { data: session, isPending, error, refetch } = authClient.useSession();

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
						onClick={() =>
							authClient.signIn.social({
								provider: "discord",
								callbackURL: `${window.location.origin}/`,
							})
						}
					>
						<LogIn />
						<span>Login with Discord</span>
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
							<Server />
							<span>Server</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<DropdownMenuSub>
									<DropdownMenuSubTrigger>NAW</DropdownMenuSubTrigger>
									<DropdownMenuPortal>
										<DropdownMenuSubContent>
											<DropdownMenuCheckboxItem
												checked={settingsStore.server === "Thaemine"}
												onCheckedChange={() =>
													settingsStore.setServer("Thaemine")
												}
											>
												<span>Thaemine</span>
											</DropdownMenuCheckboxItem>
											<DropdownMenuCheckboxItem
												checked={settingsStore.server === "Brelshaza"}
												onCheckedChange={() =>
													settingsStore.setServer("Brelshaza")
												}
											>
												<span>Brelshaza</span>
											</DropdownMenuCheckboxItem>
										</DropdownMenuSubContent>
									</DropdownMenuPortal>
								</DropdownMenuSub>
								<DropdownMenuSub>
									<DropdownMenuSubTrigger>NAE</DropdownMenuSubTrigger>
									<DropdownMenuPortal>
										<DropdownMenuSubContent>
											<DropdownMenuCheckboxItem
												checked={settingsStore.server === "Luterra"}
												onCheckedChange={() =>
													settingsStore.setServer("Luterra")
												}
											>
												<span>Luterra</span>
											</DropdownMenuCheckboxItem>
											<DropdownMenuCheckboxItem
												checked={settingsStore.server === "Balthorr"}
												onCheckedChange={() =>
													settingsStore.setServer("Balthorr")
												}
											>
												<span>Balthorr</span>
											</DropdownMenuCheckboxItem>
											<DropdownMenuCheckboxItem
												checked={settingsStore.server === "Nineveh"}
												onCheckedChange={() =>
													settingsStore.setServer("Nineveh")
												}
											>
												<span>Nineveh</span>
											</DropdownMenuCheckboxItem>
											<DropdownMenuCheckboxItem
												checked={settingsStore.server === "Inanna"}
												onCheckedChange={() =>
													settingsStore.setServer("Inanna")
												}
											>
												<span>Inanna</span>
											</DropdownMenuCheckboxItem>
											<DropdownMenuCheckboxItem
												checked={settingsStore.server === "Vairgrys"}
												onCheckedChange={() =>
													settingsStore.setServer("Vairgrys")
												}
											>
												<span>Vairgrys</span>
											</DropdownMenuCheckboxItem>
										</DropdownMenuSubContent>
									</DropdownMenuPortal>
								</DropdownMenuSub>
								<DropdownMenuSub>
									<DropdownMenuSubTrigger>EUC</DropdownMenuSubTrigger>
									<DropdownMenuPortal>
										<DropdownMenuSubContent>
											<DropdownMenuCheckboxItem
												checked={settingsStore.server === "Ortuus"}
												onCheckedChange={() =>
													settingsStore.setServer("Ortuus")
												}
											>
												<span>Ortuus</span>
											</DropdownMenuCheckboxItem>
											<DropdownMenuCheckboxItem
												checked={settingsStore.server === "Elpon"}
												onCheckedChange={() => settingsStore.setServer("Elpon")}
											>
												<span>Elpon</span>
											</DropdownMenuCheckboxItem>
											<DropdownMenuCheckboxItem
												checked={settingsStore.server === "Ratik"}
												onCheckedChange={() => settingsStore.setServer("Ratik")}
											>
												<span>Ratik</span>
											</DropdownMenuCheckboxItem>
											<DropdownMenuCheckboxItem
												checked={settingsStore.server === "Arcturus"}
												onCheckedChange={() =>
													settingsStore.setServer("Arcturus")
												}
											>
												<span>Arcturus</span>
											</DropdownMenuCheckboxItem>
											<DropdownMenuCheckboxItem
												checked={settingsStore.server === "Gienah"}
												onCheckedChange={() =>
													settingsStore.setServer("Gienah")
												}
											>
												<span>Gienah</span>
											</DropdownMenuCheckboxItem>
										</DropdownMenuSubContent>
									</DropdownMenuPortal>
								</DropdownMenuSub>
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
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
