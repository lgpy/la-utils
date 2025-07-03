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
import { useEffect, useState } from "react"
import { useAlertManager, type QueuedAlert } from "./AlertDialog.hooks"

export function GlobalAlertDialog() {
  const [currentAlert, setCurrentAlert] = useState<QueuedAlert | null>(null);
  const { resolveCurrentAlert, subscribe } = useAlertManager();

  useEffect(() => {
    const unsubscribe = subscribe((alert) => {
      setCurrentAlert(alert);
    });

    return unsubscribe;
  }, [subscribe]);

  const handleDecision = (decision: boolean) => {
    if (currentAlert) {
      resolveCurrentAlert(decision);
      // The alert will be cleared by the subscription update
    }
  };

  if (!currentAlert) {
    return null;
  }

  const { config } = currentAlert;

  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{config.title}</AlertDialogTitle>
          {config.description && (
            <AlertDialogDescription>
              {config.description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => handleDecision(false)}>
            {config.cancelButton?.text ?? "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => handleDecision(true)}>
            {config.confirmButton?.text ?? "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
