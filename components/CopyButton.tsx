import { CheckIcon, ClipboardIcon } from "lucide-react";
import React, { RefAttributes, useState, useEffect } from "react";
import { Button, ButtonProps } from "./ui/button";
import { cn } from "@/lib/utils";

type Props = {
  textToCopy: string;
  children?: React.ReactNode;
  iconClassName?: string;
} & React.HTMLAttributes<HTMLButtonElement> &
  ButtonProps;

export default function CopyButton(props: Props) {
  const { textToCopy, children, iconClassName, ...rest } = props;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(textToCopy.toString());
    setCopied(true);
  };

  return (
    <Button onClick={copyToClipboard} {...rest}>
      {children}
      {copied ? (
        <CheckIcon
          className={cn(
            "size-4",
            {
              "ml-2": props.size !== "icon",
            },
            iconClassName,
          )}
        />
      ) : (
        <ClipboardIcon
          className={cn(
            "size-4",
            {
              "ml-2": props.size !== "icon",
            },
            iconClassName,
          )}
        />
      )}
    </Button>
  );
}
