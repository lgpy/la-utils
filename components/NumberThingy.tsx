import { formatGold } from "@/lib/utils";
import { animate } from "framer-motion";
import { has } from "lodash";
import React, { useEffect, useRef, useState } from "react";

interface Props {
  n: number;
}

export default function NumberThingy({ n }: Props) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const [oldn, setOldn] = useState(n);

  useEffect(() => {
    const node = nodeRef.current;

    const controls = animate(oldn, n, {
      duration: 0.2,
      onUpdate(value) {
        node!.textContent = formatGold(value);
      },
      onComplete: () => {
        setOldn(n);
      },
    });

    return () => controls.stop();
  }, [n, oldn]);

  return <span ref={nodeRef} />;
}
