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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

export default function OldWebsiteDeprecatedMessage() {
  const [value, setValue, removeValue] = useLocalStorage(
    "hide-domain-change-notice",
    false,
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (window.location.hostname === "la-utilsv2.vercel.app") {
      setIsOpen(!value);
    }
  }, []);

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Notice</AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col gap-2">
            <span>
              The old website has been taken down. You can now access this
              website with the old domain,{" "}
              <Link
                href="https://la-utils.vercel.app/"
                className="underline text-primary hover:primary/80"
                target="_blank"
              >
                la-utils.vercel.app
              </Link>
              .
            </span>
            <span>
              If you wish to migrate to the old domain, use the
              &quot;Import/Export Data&quot; feature by accessing the cogweel on
              the top right of the website.
            </span>
            <span>
              This domain (la-utilsv2.vercel.app) will not be taken down.
            </span>
            <span className="text-right">Thank you for using the website</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setValue(true)}>
            Don&apos;t show me this again
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => setIsOpen(false)} autoFocus>
            Okay
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
