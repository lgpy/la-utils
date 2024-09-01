"use client";

import { cn } from "@/lib/utils";
import { forwardRef, useRef } from "react";

type Props = {
  progress: number;
  className?: string;
};

const PiggyBankProgressBar = forwardRef<HTMLDivElement, Props>(
  ({ progress, className: classname, ...props }, ref) => {
    /* width starts at 6 for 0% and ends at 21 for 100% */
    const width = 6 + (progress / 100) * 16;

    const clipPathId = useRef(
      Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15),
    );

    const eyeColor = width < 15 ? "hsl(var(--yellow))" : "hsl(var(--card))";

    return (
      <div {...props} ref={ref} className={cn(classname)}>
        <div className="relative aspect-square">
          <svg
            viewBox="0 0 24 24"
            className="w-full h-full"
            style={{
              filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))",
            }}
          >
            {/* Piggy Bank Outline */}
            <path
              d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z"
              fill="none"
              stroke="hsl(var(--yellow))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 9v1c0 1.1.9 2 2 2h1"
              fill="none"
              stroke="hsl(var(--yellow))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Fill */}
            <path
              d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z"
              fill={`hsl(var(--yellow))`}
              opacity="1"
              clipPath={`url(#${clipPathId.current})`}
            />
            <clipPath id={clipPathId.current}>
              <rect x="0" y="0" width={width} height="24" />
            </clipPath>

            <path
              d="M16 11h.01"
              fill="none"
              stroke={eyeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    );
  },
);
PiggyBankProgressBar.displayName = "PiggyBankProgressBar";

export default PiggyBankProgressBar;
