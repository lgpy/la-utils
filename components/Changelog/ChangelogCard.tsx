"use client";

import { OrpcOutputs } from "@/lib/orpc";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChangelogDetailType } from "@/prisma/generated/enums";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { EyeOffIcon } from "lucide-react";

function getDetailTypeUiConfig(type: ChangelogDetailType) {
	switch (type) {
		case ChangelogDetailType.adition:
			return { label: "Added", color: "bg-ctp-green text-background" };
		case ChangelogDetailType.fix:
			return { label: "Fixed", color: "bg-ctp-blue text-background" };
		case ChangelogDetailType.removal:
			return { label: "Removed", color: "bg-ctp-red text-background" };
		case ChangelogDetailType.improvement:
			return { label: "Improved", color: "bg-ctp-mauve text-background" };
		case ChangelogDetailType.change:
			return { label: "Changed", color: "bg-ctp-peach text-background" };
		default:
			const _exhaustiveCheck: never = type;
			return { label: "Unknown", color: "bg-gray-500 text-white" };
	}
}

type ChangelogEntryCardProps = {
	entry: OrpcOutputs["changelog"]["paginatedChangelog"]["entries"][number];
	isNew?: boolean;
	showEditButton?: boolean;
};

export default function ChangelogEntryCard({
	entry,
	isNew,
	showEditButton,
}: ChangelogEntryCardProps) {
	const router = useRouter();

	return (
		<Card
			id={`cl-${entry.id}`}
			className={cn({
				"border-dashed": entry.isVisible !== undefined && !entry.isVisible,
			})}
		>
			<CardHeader className="flex justify-between items-start">
				<div>
					<CardTitle className="text-lg flex items-center justify-between gap-2">
						<span>{entry.title}</span>
						{entry.isVisible !== undefined && !entry.isVisible && (
							<EyeOffIcon className="size-5 text-destructive" />
						)}
					</CardTitle>
					<CardDescription className="flex items-center gap-2 mt-1">
						<span>{format(entry.date, "MMM dd, yyyy")}</span>
					</CardDescription>
				</div>
				<div className="flex flex-row gap-2">
					{isNew && (
						<Badge variant="destructive" className="text-xs px-2 py-0.5">
							NEW
						</Badge>
					)}
					{showEditButton && (
						<Button onClick={() => router.push(`/changelog/${entry.id}`)}>
							Edit
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground mb-3">
					{entry.description}
				</p>
				{entry.details && entry.details.length > 0 && (
					<ul className="text-sm flex flex-col gap-2">
						{entry.details.map((detail) => {
							const detailUiConfig = getDetailTypeUiConfig(detail.type);

							return (
								<li
									key={`${entry.id}-detail-${detail.id}`}
									className="grid grid-cols-[65px_1fr] gap-3 items-start "
								>
									<Badge
										variant="secondary"
										className={cn(
											`text-xs px-2 py-0.5 w-full justify-center`,
											detailUiConfig.color
										)}
									>
										{detailUiConfig.label}
									</Badge>
									<span className="text-sm">{detail.description}</span>
								</li>
							);
						})}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}
