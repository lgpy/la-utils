import { CheckIcon, ClipboardIcon } from "lucide-react";
import React, { RefAttributes, useState, useEffect } from "react";
import { Button, ButtonProps } from "./ui/button";

type Props = {
  textToCopy: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLButtonElement> &
  ButtonProps;

export default function CopyButton(props: Props) {
  const { textToCopy, children, ...rest } = props;
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
        <CheckIcon className="ml-2 h-4 w-4" />
      ) : (
        <ClipboardIcon className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
}
