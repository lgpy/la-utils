"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Logo(props: { className?: string }) {
  const [logoNumber, setLogoNumber] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const newLogo = Math.floor(Math.random() * 3);
    setLogoNumber(newLogo);
  }, [pathname]);

  return (
    <div className={cn("flex items-center justify-center", props.className)}>
      <Image
        alt=""
        height={59}
        quality={100}
        src={`/logo-${logoNumber}.png`}
        width={65.47}
      />
    </div>
  );
}
