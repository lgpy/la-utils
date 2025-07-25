import { raidData } from "@/lib/game-info";
import { type Character, useMainStore } from "@/stores/main-store/provider";
import { motion } from "motion/react";
import type { MouseEventHandler } from "react";

interface Props {
	charId: string;
	raidId: string;
	assignedGates: Character["assignedRaids"][string];
}

function SingularButton({
	onClick,
	active,
	index,
	total,
}: {
	onClick: MouseEventHandler<HTMLDivElement>;
	active: boolean;
	index: number;
	total: number;
}) {
	return (
		<div
			className="px-0.5 py-3 cursor-pointer"
			onMouseDown={onClick}
			onContextMenu={(e) => {
				e.preventDefault();
			}}
		>
			<div className="size-5 bg-ctp-surface1 rounded-full shadow flex justify-center items-center">
				<motion.div
					className="size-3 bg-primary rounded-full"
					initial={false}
					animate={active ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
					transition={{
						delay: active
							? index * (0.2 / total)
							: (total - index) * (0.2 / total),
						duration: 0.2,
					}}
				/>
			</div>
		</div>
	);
}

export default function TodoCardCompleteButtonV2({
	charId,
	raidId,
	assignedGates,
}: Props) {
	const mainStore = useMainStore();

	const buttons = Object.entries(assignedGates).map(
		([gateId, gate], idx, arr) => {
			const raid = raidData.get(raidId);
			if (!raid) return null;

			const handleClick: MouseEventHandler<HTMLDivElement> = (event) => {
				event.preventDefault();
				if (event.altKey && event.button === 0) {
					mainStore.toggleSingleGate(charId, raidId, gateId);
				} else if (event.altKey && event.button === 2) {
					mainStore.untoggleSingleGate(charId, raidId, gateId);
				} else if (event.shiftKey && event.button === 0) {
					mainStore.toggleAllGates(charId, raidId);
				} else if (event.shiftKey && event.button === 2) {
					mainStore.untoggleAllGates(charId, raidId);
				} else if (event.button === 0) {
					mainStore.toggleGate(charId, raidId, gateId);
				} else if (event.button === 2) {
					mainStore.untoggleGate(charId, raidId, gateId);
				}
			};

			return (
				<SingularButton
					key={raidId + gateId}
					active={gate.completed}
					onClick={handleClick}
					index={idx}
					total={arr.length}
				/>
			);
		},
	);

	return buttons;
}
