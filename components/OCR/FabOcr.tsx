"use client";

import { motion } from "motion/react";
import { ScanText } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import PricesOCR from "./OCRComponent";

export default function FabOCR() {
  const [isOpen, onOpenChange] = useState(false);

  return (
    <div className="fixed right-4 bottom-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 260,
            damping: 20,
          },
        }}
      >
        <Button
          color="secondary"
          size={"icon"}
          onClick={() => onOpenChange(true)}
        >
          <ScanText className="size-6" />
        </Button>
      </motion.div>
      <PricesOCR isOpen={isOpen} onOpenChange={onOpenChange} />
    </div>
  );
}
