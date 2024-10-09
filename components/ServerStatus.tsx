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

export default function ServerStatus() {
  const { store, hasHydrated } = useSettingsStore((store) => store);

  const [serverStatus, setServerStatus] = useState<string | null>(null);
  const [prevServerStatus, setPrevServerStatus] = useState<string | null>(null);
  const { toast } = useToast();

  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (serverStatus === prevServerStatus) return;
    if (serverStatus === null) setPrevServerStatus(serverStatus);
    if (serverStatus === "online" && prevServerStatus === "offline") {
      setPrevServerStatus(serverStatus);
      if (!audioContext.current) audioContext.current = new AudioContext();
      beep(audioContext.current, 30);
      toast({
        title: `Server ${store.server} is back online!`,
        duration: 240000,
      });
    } else {
      setPrevServerStatus(serverStatus);
    }
  }, [serverStatus, prevServerStatus, store.server]);

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
        : 1000 * 60 * 60 * 2;
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
