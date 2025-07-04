"use client";

import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NotificationDropdown from "./NotificationDropdown";
import Logo from "./Logo";
import ServerStatusWidget from "./ServerStatusWidget";
import SettingsButton from "./SettingsButton";
import { Button } from "./ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "./ui/sheet";

const links = [
	{ id: "home", label: "Home", href: "/" },
	{ id: "characters", label: "Characters", href: "/characters" },
	{ id: "prices", label: "Prices", href: "/prices" },
	{ id: "crafting", label: "Crafting", href: "/crafting" },
	{ id: "stone", label: "Stone", href: "/stone" },
	{ id: "changelog", label: "Changelog", href: "/changelog" },
];

export default function NavBar() {
	const currentPath = usePathname();

	return (
		<header className="sticky top-0 flex h-16 items-center gap-4 border-b-2 bg-background px-4 md:px-6 border-primary z-50">
			<nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 h-full">
				<Link
					href="/"
					className="flex flex-row gap-2 justify-center items-center h-full"
				>
					<Logo className="self-end" />
					<span className="text-xl font-extrabold text-primary">
						Lost Ark Utils
					</span>
				</Link>
				{links.map(({ id, label, href }) => (
					<div
						key={id}
						className={cn("h-full flex items-center px-2 relative", {
							active: href === currentPath,
						})}
					>
						<Link
							href={href}
							className={cn(
								"text-muted-foreground transition-colors hover:text-foreground",
							)}
						>
							{label}
						</Link>
						{href === currentPath && (
							<motion.div
								className="bottom-radial-gradient mx-auto absolute bottom-0 left-0 right-0 w-[40px] h-[20px]"
								layoutId="activeNavItem"
								layout
								style={{ originY: "top" }}
							/>
						)}
					</div>
				))}
			</nav>
			<Sheet>
				<SheetTrigger asChild>
					<Button variant="outline" size="icon" className="shrink-0 md:hidden">
						<Menu />
						<span className="sr-only">Toggle navigation menu</span>
					</Button>
				</SheetTrigger>
				<SheetContent side="left" className="w-[250px]">
					<SheetHeader className="flex flex-row items-center gap-4">
						<SheetTitle className="text-primary text-xl font-extrabold">
							Lost Ark Utils
						</SheetTitle>
					</SheetHeader>
					<nav className="grid gap-6 text-lg font-medium px-4">
						{links.map(({ id, label, href }) => (
							<SheetClose asChild key={id}>
								<Link
									href={href}
									className={cn("text-muted-foreground hover:text-foreground", {
										"underline underline-offset-2": href === currentPath,
									})}
								>
									{label}
								</Link>
							</SheetClose>
						))}
					</nav>
				</SheetContent>
			</Sheet>
			<div className="ml-auto flex flex-row gap-2">
				<NotificationDropdown />
				<SettingsButton />
			</div>
		</header>
	);
}
