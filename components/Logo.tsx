"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Logo() {
  const [logoNumber, setLogoNumber] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const newLogo = Math.floor(Math.random() * 3);
    setLogoNumber(newLogo);
  }, [pathname]);

  return (
    <div className="w-[70px] items-center">
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
