import { formatGold } from "@/lib/utils";
import { animate } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

interface Props {
  n: number;
  format?: "gold" | "number";
}

export default function AnimatedNumber({ n, format = "number" }: Props) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const [oldn, setOldn] = useState(n);

  useEffect(() => {
    const node = nodeRef.current;

    const controls = animate(oldn, n, {
      duration: 0.2,
      onUpdate(value) {
        node!.textContent =
          format === "gold" ? formatGold(value) : String(value);
      },
      onComplete: () => {
        setOldn(n);
      },
    });

    return () => controls.stop();
  }, [n, oldn, format]);

  return <span ref={nodeRef} />;
}
