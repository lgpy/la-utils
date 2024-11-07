import { animate } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface Props {
  n: number;
}

const fmt = (gold: number) =>
  Math.abs(gold) > 1000
    ? `${(gold / 1000).toFixed(gold % 1000 === 0 ? 0 : 1)}k`
    : gold;

export default function NumberThingy({ n }: Props) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const [oldn, setOldn] = useState(n);

  useEffect(() => {
    const node = nodeRef.current;

    const controls = animate(oldn, n, {
      duration: 0.2,
      onUpdate(value) {
        node!.textContent = String(fmt(value));
      },
      onComplete: () => {
        setOldn(n);
      },
    });

    return () => controls.stop();
  }, [n, oldn]);

  return <span ref={nodeRef} />;
}
