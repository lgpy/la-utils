import NavBar from "@/components/NavBar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";
import { MainStoreProvider } from "@/stores/main-store/provider";
import { ChangelogStoreProvider } from "@/stores/changelog-store.provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { UserInfoUpdater } from "@/components/UserInfoUpdater";
import "@/lib/orpc.server";
import { OrpcProvider } from "@/lib/orpc.provider";
import { GlobalAlertDialog } from "@/components/AlertDialog";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: {
		template: "%s | Lost Ark Utils",
		default: "Lost Ark Utils",
	},
	description: "A set of utilities for Lost Ark",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={cn(
					inter.className,
					"min-h-screen bg-background antialiased flex flex-col"
				)}
			>
				<OrpcProvider>
					<MainStoreProvider>
						<ChangelogStoreProvider>
							<ThemeProvider
								attribute="class"
								defaultTheme="system"
								enableSystem
								disableTransitionOnChange
							>
								<NavBar />
								<main className="grow container mx-auto px-4 sm:px-6 lg:px-8 py-4">
									{children}
								</main>
								<footer className="mb-2 text-center text-xs text-muted-foreground/50">
									For feedback, bug reports, or feature requests, join the{" "}
									<a
										href="https://discord.gg/zHzU8HZfWp"
										target="_blank"
										rel="noopener noreferrer"
										className="underline"
									>
										Discord server
									</a>
									.
								</footer>
								<Toaster position="bottom-center" />
								<GlobalAlertDialog />
								<UserInfoUpdater />
							</ThemeProvider>
						</ChangelogStoreProvider>
					</MainStoreProvider>
				</OrpcProvider>
			</body>
		</html>
	);
}
