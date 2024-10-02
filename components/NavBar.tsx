"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import Logo from "./Logo";
import SettingsButton from "./SettingsButton";
import { Button } from "./ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "./ui/sheet";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import "./NavBar.css";
import {
  ServerStoreProvider,
  useServerStore,
} from "@/providers/ServerProvider";
import ServerStatus from "./ServerStatus";

const links = [
  { label: "Home", href: "/" },
  { label: "Characters", href: "/characters" },
  { label: "Prices", href: "/prices" },
  { label: "Crafting", href: "/crafting" },
];

export default function NavBar() {
  const currentPath = usePathname();

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b-2 bg-background2 px-4 md:px-6 border-primary z-50">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 h-full">
        <Link
          href="/"
          className="flex flex-row gap-2 justify-center items-center h-full"
        >
          <Logo className="mt-auto" />
          <span className="text-xl font-extrabold bg-[length:200%_auto] from-primary from-30% via-secondary via-50% to-primary to-70% bg-gradient-to-r bg-clip-text text-transparent animate-gradient">
            Lost Ark Utils
          </span>
        </Link>
        {links.map(({ label, href }, index) => (
          <div
            key={"dl" + index}
            className={cn("h-full flex items-center px-2 dlink", {
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
          </div>
        ))}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <SheetClose asChild>
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Logo />
                <span className="text-xl font-extrabold bg-[length:200%_auto] from-primary via-secondary to-primary bg-gradient-to-r bg-clip-text text-transparent animate-gradient">
                  Lost Ark Utils
                </span>
              </Link>
            </SheetClose>
            {links.map(({ label, href }, index) => (
              <SheetClose asChild key={"ml" + index}>
                <Link
                  href={href}
                  className={cn(
                    "text-muted-foreground hover:text-foreground mlink",
                    {
                      active: href === currentPath,
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
        <ServerStoreProvider>
          <ServerStatus />
          <Button variant="ghost" size="icon">
            <Link href="https://ko-fi.com/leo213" target="_blank">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                className="size-5"
                viewBox="0 0 24 24"
                role="img"
              >
                <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z" />
              </svg>
            </Link>
          </Button>
          <SettingsButton />
        </ServerStoreProvider>
      </div>
    </header>
  );
}
