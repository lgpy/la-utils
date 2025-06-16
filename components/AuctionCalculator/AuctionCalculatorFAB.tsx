"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { GavelIcon } from "lucide-react";
import { useState } from "react";
import AuctionCalculatorModalContent from "./AuctionCalculatorModalContent";
import { FabButtonWrapper } from "../FabButtonWrapper";
import { ExpandableButton } from "../ExpandableButton";

export default function AuctionCalculatorFAB() {
	const [isOpen, onOpenChange] = useState(false);

	return (
		<>
			<FabButtonWrapper>
				<ExpandableButton
					label="Auction Calculator"
					onClick={() => onOpenChange(true)}
				>
					<GavelIcon className="size-6" />
				</ExpandableButton>
			</FabButtonWrapper>
			<Dialog open={isOpen} onOpenChange={(open) => onOpenChange(open)}>
				<DialogContent>
					<AuctionCalculatorModalContent />
				</DialogContent>
			</Dialog>
		</>
	);
}
