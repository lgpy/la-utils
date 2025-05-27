"use client";

import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import ServerStatusWidget from "./ServerStatusWidget";
import SettingsButton from "./SettingsButton";
import { Button } from "./ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { motion } from "motion/react";

const links = [
  { label: "Home", href: "/" },
  { label: "Characters", href: "/characters" },
  { label: "Prices", href: "/prices" },
  { label: "Crafting", href: "/crafting" },
  { label: "Stone (WIP)", href: "/stone" },
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
        {links.map(({ label, href }, index) => (
          <div
            key={"dl" + index}
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
            <SheetTitle className="text-primary text-xl font-extrabold">Lost Ark Utils</SheetTitle>
          </SheetHeader>
          <nav className="grid gap-6 text-lg font-medium px-4">
            {links.map(({ label, href }, index) => (
              <SheetClose asChild key={"ml" + index}>
                <Link
                  href={href}
                  className={cn(
                    "text-muted-foreground hover:text-foreground",
                    {
                      "underline underline-offset-2": href === currentPath,
                    },
                  )}
                >
                  {label}
                </Link>
              </SheetClose>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="ml-auto flex flex-row gap-2">
        <ServerStatusWidget />
        <Button variant="ghost" size="icon">
          <Link href="https://ko-fi.com/leo213" target="_blank">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              role="img"
            >
              <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z" />
            </svg>
          </Link>
        </Button>
        <SettingsButton />
      </div>
    </header>
  );
}
