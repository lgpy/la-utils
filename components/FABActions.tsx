"use client";

import { GavelIcon } from "lucide-react";
import { useState } from "react";
import AuctionCalculatorModalContent from "./AuctionCalculatorModalContent";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";

export default function FABActions() {
  const [isOpen, onOpenChange] = useState(false);

  return (
    <div className="fixed right-4 bottom-4">
      <Button color="secondary" size="icon" onClick={() => onOpenChange(true)}>
        <GavelIcon className="size-6" />
      </Button>
      <Dialog open={isOpen} onOpenChange={(open) => onOpenChange(open)}>
        <DialogContent>
          <AuctionCalculatorModalContent />
        </DialogContent>
      </Dialog>
    </div>
  );
}
