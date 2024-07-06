import React from "react";

import classes from "./Icon.module.css";
import { cn } from "@/lib/utils";

interface Props {
  size: number;
  svgProps?: React.SVGProps<SVGSVGElement>;
  svgElement: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export default function IconWrapper({ svgProps, svgElement, size }: Props) {
  return (
    <div className={cn("dark:fill-white fill-black")}>
      {React.createElement(svgElement, {
        ...svgProps,
        className: classes.icon,
        style: {
          width: size,
          height: size,
        },
      })}
    </div>
  );
}
