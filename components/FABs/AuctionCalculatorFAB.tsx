"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { GavelIcon } from "lucide-react";
import { useState } from "react";
import AuctionCalculator from "./AuctionCalculator";
import { FabButtonWrapper } from "./FabButtonWrapper";
import { ExpandableButton } from "../ExpandableButton";
import {
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

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
					<DialogHeader>
						<DialogTitle className="flex flex-row gap-2 items-center">
							<GavelIcon className="size-6" /> Auction Calculator
						</DialogTitle>
						<DialogDescription>
							Calculate the bid amount for an auction based on the market value.
						</DialogDescription>
					</DialogHeader>
					<AuctionCalculator />
				</DialogContent>
			</Dialog>
		</>
	);
}
