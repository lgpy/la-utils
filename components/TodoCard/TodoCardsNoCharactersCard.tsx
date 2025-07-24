import Image from "next/image";

import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export function TodoCardsNoCharactersCard() {
	return (
		<Card className="max-w-[350px]">
			<CardContent className="p-3 pb-0 pl-0">
				<div className="flex flex-row items-center">
					<Image
						alt=""
						height={820 / 8}
						quality={100}
						src={"/logo-2.png"}
						width={910 / 8}
						className="mt-auto"
					/>
					<div>
						<CardTitle className="text-xl">
							Looks like you don&apos;t have any characters
						</CardTitle>
						<CardDescription className="text-muted-foreground pb-3">
							You can add characters using the{" "}
							<Link
								className="text-primary underline hover:text-primary/80"
								href="/characters"
							>
								character page
							</Link>
							.
						</CardDescription>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
