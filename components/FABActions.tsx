"use client";

import { GavelIcon } from "lucide-react";
import { use, useEffect, useState } from "react";
import AuctionCalculatorModalContent from "./AuctionCalculatorModalContent";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";
import { set } from "zod";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function FABActions() {
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
          <GavelIcon className="size-6" />
        </Button>
      </motion.div>
      <Dialog open={isOpen} onOpenChange={(open) => onOpenChange(open)}>
        <DialogContent>
          <AuctionCalculatorModalContent />
        </DialogContent>
      </Dialog>
    </div>
  );
}
