import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Character } from "@/stores/main-store/provider";
import { MoveIcon, Trash2Icon } from "lucide-react";

type Props = {
	char: Character;
	deleteCharacter: () => void;
	movable?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export default function EditCard(props: Props) {
	const { char, deleteCharacter, movable = false, ...divProps } = props;

	return (
		<Card className="h-fit w-56 py-0 gap-0 overflow-hidden" {...divProps}>
			<div className="p-4 flex flex-row gap-2 items-center justify-between relative">
				<h2 className="font-bold" data-pw="character-name">
					{char.name}
				</h2>
				{movable && (
					<MoveIcon className="mover size-4 absolute top-1 mx-auto right-0 left-0 mt-0! cursor-move" />
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
