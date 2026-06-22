import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Character } from "@/stores/main-store/provider";
import { GripHorizontal, Trash2Icon } from "lucide-react";
import type { RefObject } from "react";

type Props = {
	char: Character;
	deleteCharacter: () => void;
	drag: {
		disabled: boolean;
		moveRef: RefObject<SVGSVGElement | null>;
		isDragging: boolean;
	};
} & React.HTMLAttributes<HTMLDivElement>;

export default function EditCard(props: Props) {
	const { char, deleteCharacter, drag, ...divProps } = props;

	return (
		<Card
			className={cn("h-fit w-56 py-0 gap-0 overflow-hidden", {
				"shadow-2xl opacity-75": drag.isDragging,
			})}
			{...divProps}
		>
			<div className="p-4 flex flex-row gap-2 items-center justify-between relative">
				<h2 className="font-bold" data-pw="character-name">
					{char.name}
				</h2>
				{!drag.disabled && (
					<GripHorizontal
						className="size-4 absolute top-1 mx-auto right-0 left-0 mt-0! cursor-grab"
						ref={drag.moveRef}
					/>
				)}
				<Button
					variant="destructive"
					size="icon"
					className="size-8"
					onClick={() => deleteCharacter()}
				>
					<Trash2Icon />
				</Button>
			</div>
		</Card>
	);
}
