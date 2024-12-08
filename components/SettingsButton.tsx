"use client";
import {
  FlaskConical,
  Import,
  Moon,
  SettingsIcon,
  Sun,
  SunMoon,
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
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useSettingsStore } from "@/providers/SettingsProvider";

export default function SettingsButton() {
  const { setTheme, theme } = useTheme();
  const { store, hasHydrated } = useSettingsStore((store) => store);
  const router = useRouter();

  const ThemeIcon = (() => {
    switch (theme) {
      case "light":
        return <Sun className="mr-2 h-4 w-4" />;
      case "dark":
        return <Moon className="mr-2 h-4 w-4" />;
      case "system":
        return <SunMoon className="mr-2 h-4 w-4" />;
      default:
        return <SunMoon className="mr-2 h-4 w-4" />;
    }
  })();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={!hasHydrated}>
        <Button variant="outline" size="icon">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 hover:">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push("/backup")}>
          <Import className="mr-2 h-4 w-4" />
          <span>Import/Export Data</span>
        </DropdownMenuItem>
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="focus:text-background data-[state=open]:text-background">
              {ThemeIcon}
              <span>Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuCheckboxItem
                  checked={theme === "light"}
                  onCheckedChange={() => setTheme("light")}
                >
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={theme === "dark"}
                  onCheckedChange={() => setTheme("dark")}
                >
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={theme === "system"}
                  onCheckedChange={() => setTheme("system")}
                >
                  <SunMoon className="mr-2 h-4 w-4" />
                  <span>System</span>
                </DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="focus:text-background data-[state=open]:text-background">
              <span>Server</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="focus:text-background data-[state=open]:text-background">
                    NAW
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuCheckboxItem
                        checked={store.server === "Thaemine"}
                        onCheckedChange={() => store.setServer("Thaemine")}
                      >
                        <span>Thaemine</span>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={store.server === "Brelshaza"}
                        onCheckedChange={() => store.setServer("Brelshaza")}
                      >
                        <span>Brelshaza</span>
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="focus:text-background data-[state=open]:text-background">
                    NAE
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuCheckboxItem
                        checked={store.server === "Luterra"}
                        onCheckedChange={() => store.setServer("Luterra")}
                      >
                        <span>Luterra</span>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={store.server === "Balthorr"}
                        onCheckedChange={() => store.setServer("Balthorr")}
                      >
                        <span>Balthorr</span>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={store.server === "Nineveh"}
                        onCheckedChange={() => store.setServer("Nineveh")}
                      >
                        <span>Nineveh</span>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={store.server === "Inanna"}
                        onCheckedChange={() => store.setServer("Inanna")}
                      >
                        <span>Inanna</span>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={store.server === "Vairgrys"}
                        onCheckedChange={() => store.setServer("Vairgrys")}
                      >
                        <span>Vairgrys</span>
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="focus:text-background data-[state=open]:text-background">
                    EUC
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuCheckboxItem
                        checked={store.server === "Ortuus"}
                        onCheckedChange={() => store.setServer("Ortuus")}
                      >
                        <span>Ortuus</span>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={store.server === "Elpon"}
                        onCheckedChange={() => store.setServer("Elpon")}
                      >
                        <span>Elpon</span>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={store.server === "Ratik"}
                        onCheckedChange={() => store.setServer("Ratik")}
                      >
                        <span>Ratik</span>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={store.server === "Arcturus"}
                        onCheckedChange={() => store.setServer("Arcturus")}
                      >
                        <span>Arcturus</span>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={store.server === "Gienah"}
                        onCheckedChange={() => store.setServer("Gienah")}
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
            <DropdownMenuSubTrigger className="focus:text-background data-[state=open]:text-background">
              <FlaskConical className="mr-2 h-4 w-4" />
              <span>Experiments</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuCheckboxItem
                  checked={store.experiments.buttonV2}
                  onCheckedChange={() =>
                    store.toggleExperiments(
                      "buttonV2",
                      !store.experiments.buttonV2,
                    )
                  }
                >
                  <span>Raid Button V2</span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={store.experiments.ignoreThaemineIfNoG4}
                  onCheckedChange={() =>
                    store.toggleExperiments(
                      "ignoreThaemineIfNoG4",
                      !store.experiments.ignoreThaemineIfNoG4,
                    )
                  }
                >
                  <span>Ignore Thaemine if no G4</span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={store.experiments.compactRaidCard}
                  onCheckedChange={() =>
                    store.toggleExperiments(
                      "compactRaidCard",
                      !store.experiments.compactRaidCard,
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
