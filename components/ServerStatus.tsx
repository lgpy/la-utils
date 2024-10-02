"use client";

import { useServerStore } from "@/providers/ServerProvider";
import axios from "axios";
import { Construction, Dot, Power } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export default function ServerStatus() {
  const { store, hasHydrated } = useServerStore((store) => store);

  const [serverStatus, setServerStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    if (store.name === undefined) return;
    axios.get(`/api/serverStatus`).then((res) => {
      setServerStatus(res.data[store.name!].status);
    });
    const int = setInterval(async () => {
      const res = await axios.get(`/api/serverStatus`);
      setServerStatus(res.data[store.name!].status);
    }, 1000 * 60 * 5);
    return () => {
      clearInterval(int);
    };
  }, [store, hasHydrated]);

  if (!hasHydrated) return null;
  if (store.name === undefined) return null;

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
            <span className="text-muted-foreground text-xs">{store.name}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
