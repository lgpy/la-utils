"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { GavelIcon } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import AuctionCalculatorModalContent from "./AuctionCalculatorModalContent";

export default function AuctionCalculatorFAB() {
	const [isOpen, onOpenChange] = useState(false);

	return (
		<>
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
				<Button size="icon" onClick={() => onOpenChange(true)}>
					<GavelIcon className="size-6" />
				</Button>
			</motion.div>
			<Dialog open={isOpen} onOpenChange={(open) => onOpenChange(open)}>
				<DialogContent>
					<AuctionCalculatorModalContent />
				</DialogContent>
			</Dialog>
		</>
	);
}
