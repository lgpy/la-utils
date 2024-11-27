"use client";

import axios from "axios";
import { Construction, Power } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useSettingsStore } from "@/providers/SettingsProvider";
import { useToast } from "./ui/use-toast";
import {
  getServerStatus,
  getServerStatusString,
  servers,
  ServerStatus,
} from "@/lib/servers";
import { ServerStatusResponse } from "@/app/api/serverStatus/route";
import { DateTime } from "luxon";

function beep(ac: AudioContext, volume: number) {
  return new Promise<void>((resolve, reject) => {
    volume = volume || 100;

    try {
      // You're in charge of providing a valid AudioFile that can be reached by your web app
      let soundSource = "/ringtone.mp3";
      let sound = new Audio(soundSource);

      // Set volume
      sound.volume = volume / 100;

      sound.onended = () => {
        resolve();
      };

      sound.play();
    } catch (error) {
      reject(error);
    }
  });
}

export default function ServerStatusWidget() {
  const { store, hasHydrated } = useSettingsStore((store) => store);

  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const { toast } = useToast();

  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    if (store.server === undefined) return;
    if (serverStatus === null)
      fetch(`/api/serverStatus`).then((res) =>
        res.json().then((data: ServerStatusResponse) => {
          const status = getServerStatus(data.servers, store.server!);
          setServerStatus(status);
          setLastUpdated(data.lastUpdated);
        }),
      );
    const delay =
      serverStatus === ServerStatus.OFFLINE ||
      serverStatus === ServerStatus.MAINTENANCE ||
      serverStatus === null
        ? 1000 * 60 * 5
        : 1000 * 60 * 60 * 2;
    const int = setInterval(async () => {
      const res = await fetch(`/api/serverStatus`);
      const data = await res.json();
      const status = getServerStatus(data, store.server!);
      if (
        status === ServerStatus.ONLINE &&
        (serverStatus === ServerStatus.OFFLINE ||
          serverStatus === ServerStatus.MAINTENANCE)
      ) {
        if (!audioContext.current) audioContext.current = new AudioContext();
        beep(audioContext.current, 30);
        toast({
          title: `Server ${store.server} is back online!`,
          duration: 240000,
        });
      }
      setServerStatus(status);
    }, delay);
    return () => {
      clearInterval(int);
    };
  }, [store, hasHydrated, serverStatus]);

  if (!hasHydrated) return null;
  if (store.server === undefined) return null;

  const icon = (() => {
    switch (serverStatus) {
      case ServerStatus.OFFLINE:
        return <Power className="size-4 stroke-destructive" />;
      case ServerStatus.ONLINE:
      case ServerStatus.FULL:
      case ServerStatus.BUSY:
        return <Power className="size-4 stroke-green" />;
      case ServerStatus.MAINTENANCE:
        return <Construction className="size-4 stroke-blue" />;
      default:
        return undefined;
    }
  })();

  const tooltipServerStatus =
    serverStatus !== null ? getServerStatusString(serverStatus) : "not set";

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
        <TooltipContent>
          <div>
            <p>
              Server status: <span>{tooltipServerStatus}</span>
            </p>
            <p>
              Last updated:{" "}
              {lastUpdated
                ? DateTime.fromMillis(lastUpdated).toRelative()
                : "never"}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
