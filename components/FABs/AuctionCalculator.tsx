"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAutionStore } from "@/stores/auction-store";
import { CheckIcon, ClipboardIcon, UsersIcon } from "lucide-react";
import { useEffect, useState } from "react";

function BidAmtButton({ bidAmt }: { bidAmt: number }) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (copied) {
			const timeout = setTimeout(() => {
				setCopied(false);
			}, 1500);

			return () => clearTimeout(timeout);
		}
	}, [copied]);

	const copyToClipboard = () => {
		navigator.clipboard.writeText(bidAmt.toString());
		setCopied(true);
	};

	return (
		<Button variant="ghost" onClick={copyToClipboard}>
			{bidAmt}
			{copied ? <CheckIcon /> : <ClipboardIcon />}
		</Button>
	);
}

function AuctionAmt({
	isProfit,
	marketValue,
	playerNumber,
}: {
	marketValue: number;
	isProfit: boolean;
	playerNumber: number;
}) {
	const bidAmt = isProfit
		? Math.floor(
			0.92 *
			Math.floor(
				((0.95 * marketValue) / playerNumber) * (playerNumber - 1),
			),
		)
		: Math.floor(((0.95 * marketValue) / playerNumber) * (playerNumber - 1));

	//const profit = Math.floor(0.95 * marketValue - bidAmt);
	//const others = Math.floor(bidAmt / (playerNumber - 1));

	return (
		<div className="flex flex-col gap-2 items-center">
			<p className="flex flex-row items-end gap-1">
				<span className="text-lg font-bold">{playerNumber}</span>
				<UsersIcon className="size-6" />
			</p>
			<BidAmtButton bidAmt={bidAmt} />
		</div>
	);
}

export default function AuctionCalculator() {
	const auction = useAutionStore();

	const changeValue = (value: string) => {
		const num = Number(value);

		if (Number.isNaN(num)) return;
		auction.setMarketValue(num);
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-row gap-6">
				<div className="grid w-full gap-1.5">
					<Label htmlFor="picture">Market Value</Label>
					<div className="flex gap-4">
						<Input
							placeholder="Market Value"
							type="number"
							className="no-spinner"
							value={auction.marketValue}
							onChange={(e) => changeValue(e.target.value)}
						/>
						<div className="flex items-center space-x-2">
							<Checkbox
								id="profit"
								checked={auction.isProfit}
								onCheckedChange={auction.setIsProfit}
							/>
							<label
								htmlFor="profit"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Profit?
							</label>
						</div>
					</div>
				</div>
			</div>
			<div className="flex flex-row gap-6 justify-around mt-2">
				<AuctionAmt
					isProfit={auction.isProfit}
					marketValue={auction.marketValue}
					playerNumber={4}
				/>
				<AuctionAmt
					isProfit={auction.isProfit}
					marketValue={auction.marketValue}
					playerNumber={8}
				/>
				<AuctionAmt
					isProfit={auction.isProfit}
					marketValue={auction.marketValue}
					playerNumber={16}
				/>
			</div>
		</div>
	);
}
