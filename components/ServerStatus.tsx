"use client";

import axios from "axios";
import { Construction, Dot, Power } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useSettingsStore } from "@/providers/SettingsProvider";

export default function ServerStatus() {
  const { store, hasHydrated } = useSettingsStore((store) => store);

  const [serverStatus, setServerStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    if (store.server === undefined) return;
    if (serverStatus === null)
      axios.get(`/api/serverStatus`).then((res) => {
        setServerStatus(res.data[store.server!].status);
      });
    const delay =
      serverStatus === "offline" || serverStatus === null
        ? 1000 * 60 * 5
        : 1000 * 60 * 60 * 3;
    const int = setInterval(async () => {
      const res = await axios.get(`/api/serverStatus`);
      setServerStatus(res.data[store.server!].status);
    }, delay);
    return () => {
      clearInterval(int);
    };
  }, [store, hasHydrated, serverStatus]);

  if (!hasHydrated) return null;
  if (store.server === undefined) return null;

  const icon = (() => {
    switch (serverStatus) {
      case "offline":
        return <Power className="size-4 stroke-destructive" />;
      case "online":
      case "full":
      case "busy":
        return <Power className="size-4 stroke-green" />;
      case "maintenance":
        return <Construction className="size-4 stroke-blue" />;
      default:
        return undefined;
    }
  })();

  const tooltip = (() => {
    switch (serverStatus) {
      case "offline":
        return "Offline";
      case "online":
        return "Online";
      case "full":
        return "Online - Full";
      case "busy":
        return "Online - Busy";
      case "maintenance":
        return "In Maintenance";
      default:
        return "Unknown";
    }
  })();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex gap-1 items-center select-none">
            {icon}
            <span className="text-muted-foreground text-xs">
              {store.server}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
