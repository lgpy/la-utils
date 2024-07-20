import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";
import SettingsButton from "./SettingsButton";

export default function NavBar() {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b-2 bg-background2 px-4 md:px-6 border-primary">
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
        <Link
          href="/"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Home
        </Link>
        <Link
          href="/characters"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Characters
        </Link>
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
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Logo />
              <span className="text-xl font-extrabold bg-[length:200%_auto] from-primary via-secondary to-primary bg-gradient-to-r bg-clip-text text-transparent animate-gradient">
                Lost Ark Utils
              </span>
            </Link>
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground"
            >
              Home
            </Link>
            <Link
              href="/characters"
              className="text-muted-foreground hover:text-foreground"
            >
              Characters
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="ml-auto">
        <SettingsButton />
      </div>
    </header>
  );
}
