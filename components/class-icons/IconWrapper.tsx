import { useTheme } from "next-themes";
import React from "react";
import clsx from "clsx";

import classes from "./Icon.module.css";

interface Props {
  size: number;
  svgProps?: React.SVGProps<SVGSVGElement>;
  svgElement: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export default function IconWrapper({ svgProps, svgElement, size }: Props) {
  const { theme } = useTheme();

  return (
    <div
      className={clsx({
        "fill-white": theme === "dark",
        "fill-black": theme === "light",
      })}
    >
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
