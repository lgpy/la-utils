"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useEffect, useRef, useState } from "react"
import { useAlertManager, type QueuedAlert } from "./AlertDialog.hooks"

export function GlobalAlertDialog() {
  const [currentAlert, setCurrentAlert] = useState<QueuedAlert | null>(null);
  const { resolveCurrentAlert, subscribe } = useAlertManager();
  const alertConfig = useRef<QueuedAlert["config"]>({
    title: "Alert",
  });

  useEffect(() => {
    const unsubscribe = subscribe((alert) => {
      alertConfig.current = alert.config;
      setCurrentAlert(alert);
    });

    return unsubscribe;
  }, [subscribe]);

  const handleDecision = (decision: boolean) => {
    if (currentAlert) {
      resolveCurrentAlert(decision);
      setCurrentAlert(null);
    }
  };

  return (
    <AlertDialog open={currentAlert !== null} onOpenChange={(open) => {
      if (!open) {
        handleDecision(false);
      }
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{alertConfig.current.title}</AlertDialogTitle>
          {alertConfig.current.description !== undefined && (
            <AlertDialogDescription>
              {alertConfig.current.description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => handleDecision(false)}>
            {alertConfig.current.cancelButton?.text ?? "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => handleDecision(true)}>
            {alertConfig.current.confirmButton?.text ?? "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
