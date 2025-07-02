"use client";

import { Loader2Icon, Users } from "lucide-react";
import { useState } from "react";
import FriendRaids from "./FriendRaids";
import { ExpandableButton } from "./ExpandableButton";
import { FabButtonWrapper } from "./FabButtonWrapper";
import { authClient } from "@/lib/auth";

export default function FriendRaidsFAB() {
	const [isOpen, setIsOpen] = useState(false);

	const session = authClient.useSession();

	if (!session.isPending && session.data === null) {
		return null;
	}

	return (
		<>
			<FabButtonWrapper>
				<ExpandableButton
					variant="secondary"
					label="Friend Raids"
					onClick={() => setIsOpen(!isOpen)}
					disabled={session.isPending}
				>
					{session.isPending ? (
						<Loader2Icon className="animate-spin size-6" />
					) : (
						<Users className="size-6" />
					)}
				</ExpandableButton>
			</FabButtonWrapper>
			<FriendRaids isOpen={isOpen} onOpenChange={setIsOpen} />
		</>
	);
}
