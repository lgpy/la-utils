"use client";
import { Import, Moon, SettingsIcon, Sun, SunMoon } from "lucide-react";

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
import { useServerStore } from "@/providers/ServerProvider";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export default function SettingsButton() {
  const { setTheme, theme } = useTheme();
  const { store: serverStore } = useServerStore((s) => s);
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
      <DropdownMenuTrigger asChild>
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
                        checked={serverStore.name === "Thaemine"}
                        onCheckedChange={() =>
                          serverStore.setServer("Thaemine")
                        }
                      >
                        <span>Thaemine</span>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={serverStore.name === "Brelshaza"}
                        onCheckedChange={() =>
                          serverStore.setServer("Brelshaza")
                        }
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
                        checked={serverStore.name === "Luterra"}
                        onCheckedChange={() => serverStore.setServer("Luterra")}
                      >
                        <span>Luterra</span>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={serverStore.name === "Balthorr"}
                        onCheckedChange={() =>
                          serverStore.setServer("Balthorr")
                        }
                      >
                        <span>Balthorr</span>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={serverStore.name === "Nineveh"}
                        onCheckedChange={() => serverStore.setServer("Nineveh")}
                      >
                        <span>Nineveh</span>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={serverStore.name === "Inanna"}
                        onCheckedChange={() => serverStore.setServer("Inanna")}
                      >
                        <span>Inanna</span>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={serverStore.name === "Vairgrys"}
                        onCheckedChange={() =>
                          serverStore.setServer("Vairgrys")
                        }
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
                        checked={serverStore.name === "Ortuus"}
                        onCheckedChange={() => serverStore.setServer("Ortuus")}
                      >
                        <span>Ortuus</span>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={serverStore.name === "Elpon"}
                        onCheckedChange={() => serverStore.setServer("Elpon")}
                      >
                        <span>Elpon</span>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={serverStore.name === "Ratik"}
                        onCheckedChange={() => serverStore.setServer("Ratik")}
                      >
                        <span>Ratik</span>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={serverStore.name === "Arcturus"}
                        onCheckedChange={() =>
                          serverStore.setServer("Arcturus")
                        }
                      >
                        <span>Arcturus</span>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={serverStore.name === "Gienah"}
                        onCheckedChange={() => serverStore.setServer("Gienah")}
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
