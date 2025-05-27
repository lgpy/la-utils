import Image from "next/image";

import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from "@/components/ui/card";

export default function EditCardsNoCharactersCard() {
	return (
		<Card className="max-w-[350px]">
			<CardContent className="p-3 pb-0 pl-0">
				<div className="flex flex-row items-center">
					<Image
						alt=""
						height={820 / 8}
						quality={100}
						src={"/logo-1.png"}
						width={910 / 8}
						className="mt-auto"
					/>
					<div>
						<CardTitle className="text-xl">You have no characters</CardTitle>
						<CardDescription className="text-muted-foreground pb-3">
							Add a character using the button on the bottom right.
						</CardDescription>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
